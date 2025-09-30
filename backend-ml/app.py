from flask import Flask, request, jsonify
import pandas as pd
import os
import math
import numpy as np
import uuid
from sqlalchemy import create_engine, text
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import silhouette_score

import matplotlib.pyplot as plt

app = Flask(__name__)

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "project_ml")

ENGINE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app = Flask(__name__)

def get_engine():
    return create_engine(ENGINE_URL, pool_pre_ping=True)

def fetch_datasets(columns=None, limit=5000):
    """
    Ambil data dari tabel dataset dengan limit row.
    """
    if columns is None:
        columns = ["recency", "frequency", "monetary"]

    allowed = {"customer_id", "customer_name", "recency", "frequency", "monetary"}
    cols = [c for c in columns if c in allowed]

    if not cols:
        cols = ["recency", "frequency", "monetary"]

    query = f"SELECT {', '.join(cols)} FROM dataset LIMIT {limit}"

    with get_engine().connect() as conn:
        df = pd.read_sql(text(query), conn)

    num_df = df.select_dtypes(include=["number"]).copy()
    num_df = num_df.dropna()
    return num_df, cols

def compute_elbow(max_k=10, cols=None, scale=True, limit=5000):
    """
    Hitung WCSS untuk k=1..max_k.
    """
    data, used_cols = fetch_datasets(columns=cols, limit=limit)

    if data.empty:
        return {
            "labels": [],
            "wcss": [],
            "n_rows": 0,
            "used_columns": used_cols,
            "scaled": scale
        }

    X = data.values

    if scale:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)

    max_k = max(1, min(int(max_k), 10))  # batasi max 10 sesuai permintaan

    labels = list(range(1, max_k + 1))
    wcss = []

    for k in labels:
        # n_init=10 supaya aman untuk versi scikit-learn lama/baru
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X)
        # inertia_ = jumlah SSE (WCSS)
        wcss.append(float(km.inertia_))

    return {
        "labels": labels,
        "wcss": wcss,
        "n_rows": int(data.shape[0]),
        "used_columns": used_cols,
        "scaled": scale
    }


from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import numpy as np
import pandas as pd

def run_kmeans_with_data(k=3, cols=None, scale="minmax", data_df=None):
    """
    Jalankan KMeans pada data_df.

    Args:
        k (int): jumlah cluster
        cols (list/str): kolom yang dipakai
        scale (str|bool): "minmax" | "standard" | False
        data_df (DataFrame): dataset

    Return dict:
        - labels (1..k)
        - centroids (urutan by monetary desc, sudah inverse)
        - silhouette score
        - raw data + cluster + customer_name (jika ada)
    """
    if data_df is None or len(data_df) == 0:
        return {
            "ok": True, "k": int(k), "n_rows": 0,
            "labels": [], "centroids": [], "silhouette": None,
            "raw": [], "msg": "No data"
        }

    df = pd.DataFrame(data_df).copy()

    # deteksi kolom customer_name
    customer_col = next((c for c in df.columns if c.lower() in ["customer_name", "customer", "name"]), None)

    # ambil numeric cols
    numeric_df = df.select_dtypes(include=["number"]).dropna().copy()
    if numeric_df.empty:
        return {
            "ok": True, "k": int(k), "n_rows": 0,
            "labels": [], "centroids": [], "silhouette": None,
            "raw": [], "msg": "No numeric data"
        }

    X = numeric_df.values.astype(float)

    # pilih scaler
    scaler = None
    if scale == "standard":
        scaler = StandardScaler()
    elif scale == "minmax":
        scaler = MinMaxScaler()

    if scaler:
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = X

    # k valid
    k = max(1, min(int(k), 10))

    # kmeans
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels_raw = km.fit_predict(X_scaled)
    centroids_scaled = km.cluster_centers_

    # inverse centroids ke skala asli
    centroids_orig = scaler.inverse_transform(centroids_scaled) if scaler else centroids_scaled

    # urutkan cluster by monetary desc
    try:
        monetary_idx = [c.lower() for c in numeric_df.columns].index("monetary")
    except ValueError:
        monetary_idx = min(len(numeric_df.columns) - 1, 2)

    order = np.argsort(-centroids_orig[:, monetary_idx])  # descending
    label_map = {int(old): int(new_idx) for new_idx, old in enumerate(order, start=1)}
    labels_mapped = [label_map[int(l)] for l in labels_raw]
    centroids_ordered = [centroids_orig[int(old)].tolist() for old in order]

    # silhouette score
    silhouette = None
    if k > 1 and len(np.unique(labels_raw)) > 1 and X_scaled.shape[0] > k:
        try:
            silhouette = float(silhouette_score(X_scaled, labels_raw))
        except Exception:
            silhouette = None

    # hasil raw
    raw_with_labels = numeric_df.copy()
    raw_with_labels["cluster"] = labels_mapped
    if customer_col:
        raw_with_labels["customer_name"] = df[customer_col].values

    return {
        "ok": True,
        "k": int(k),
        "n_rows": int(X.shape[0]),
        "labels": [int(x) for x in labels_mapped],
        "centroids": centroids_ordered,
        "silhouette": silhouette,
        "raw": raw_with_labels.to_dict(orient="records")
    }

@app.route("/elbow", methods=["GET"])
def elbow_api():
    try:
        max_k = int(request.args.get("max_k", 10))
        cols = request.args.get("cols")
        cols = [c.strip() for c in cols.split(",")] if cols else None
        scale = request.args.get("scale", "true").lower() == "true"
        limit = int(request.args.get("limit", 5000))  # default 5000

        result = compute_elbow(max_k=max_k, cols=cols, scale=scale, limit=limit)
        return jsonify({
            "ok": True,
            "msg": "Elbow computed",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500
    
    
@app.route("/rfm", methods=["POST"])
def rfm():
    data = request.get_json()
    file_path = data.get("path")

    print("=== REQUEST MASUK ===")
    print("File path diterima:", file_path)

    if not file_path or not os.path.exists(file_path):
        print("❌ File tidak ditemukan:", file_path)
        return jsonify({"error": f"File {file_path} tidak ditemukan"}), 404

    try:
        # Load dataset
        df = pd.read_csv(file_path, encoding="utf-8", on_bad_lines="skip")
        print("Jumlah baris dataset:", len(df))

        # pastikan kolom penting ada
        required_cols = ["Date", "Store_Type", "Customer_Name", "Transaction_ID", "Total_Cost"]
        for col in required_cols:
            if col not in df.columns:
                print(f"❌ Kolom '{col}' tidak ada di dataset")
                return jsonify({"error": f"Kolom '{col}' tidak ditemukan di file"}), 400

        # konversi Date ke datetime
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        df = df.dropna(subset=["Date"])

        # filter hanya Convenience Store
        df = df[df["Store_Type"] == "Convenience Store"]

        if df.empty:
            print("⚠️ Tidak ada data untuk Convenience Store")
            return jsonify([])

        # hitung snapshot date sekali saja
        snapshot_date = df["Date"].max() + pd.Timedelta(days=1)

        # hitung RFM
        rfm = df.groupby("Customer_Name").agg({
            "Date": lambda x: (snapshot_date - x.max()).days,
            "Transaction_ID": "count",
            "Total_Cost": "sum"
        }).reset_index()

        rfm.rename(columns={
            "Date": "Recency",
            "Transaction_ID": "Frequency",
            "Total_Cost": "Monetary"
        }, inplace=True)

        rfm.insert(0, "Customer_ID", range(1, 1 + len(rfm)))
        rfm["Store_Type"] = "Convenience Store"

        print("✅ Hasil RFM dihitung, total baris:", len(rfm))
        print(rfm.head().to_string())

        # langsung return JSON ke Node.js
        return jsonify(rfm.to_dict(orient="records"))

    except Exception as e:
        print("❌ ERROR saat proses:", str(e))
        return jsonify({"error": str(e)}), 500

# Kmeans modelling
@app.route("/kmeans", methods=["POST"])
def kmeans_api():
    try:
        body = request.get_json(force=True)
        k = int(body.get("k", 3))
        cols = body.get("cols")
        if cols and isinstance(cols, str):
            cols = [c.strip() for c in cols.split(",")]
        scale = body.get("scale", True)

        data_payload = body.get("data")
        data_df = pd.DataFrame(data_payload) if data_payload is not None else None
        if data_df is not None and cols:
            cols_lower = [c.lower() for c in data_df.columns]
            cols_present = [c for c in cols if c.lower() in cols_lower]
            if not cols_present:
                raise ValueError(f"Tidak ada kolom yang cocok di payload: {cols}")
            data_df = data_df[[col for col in data_df.columns if col.lower() in [c.lower() for c in cols_present]]]

        # === Jalankan KMeans ===
        result = run_kmeans_with_data(k=k, cols=cols, scale=scale, data_df=data_df)

        # === Simpan plot ke file ===
        if result["raw"]:
            df = pd.DataFrame(result["raw"])
            centroids = np.array(result["centroids"])

            plt.figure(figsize=(8, 6))
            scatter = plt.scatter(
                df["recency"], df["frequency"],
                c=df["cluster"],
                s=df["monetary"] / df["monetary"].max() * 200,
                cmap="viridis", alpha=0.7, edgecolors="w"
            )
            plt.scatter(
                centroids[:, 0], centroids[:, 1],
                c="red", marker="X", s=300, edgecolors="k", label="Centroids"
            )
            plt.xlabel("Recency")
            plt.ylabel("Frequency")
            plt.title(f"KMeans Scatter Plot (k={k})")
            plt.colorbar(scatter, label="Cluster")
            plt.legend()

            # Simpan ke file unik
            filename = f"kmeans_plot_{uuid.uuid4().hex[:8]}.png"
            filepath = os.path.join(os.getcwd(), filename)
            plt.savefig(filepath, dpi=150, bbox_inches="tight")
            plt.close()

            print(f"✅ Plot disimpan ke: {filepath}")

        return jsonify({
            "ok": True,
            "msg": "KMeans executed + plot disimpan ke file",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
