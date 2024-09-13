const express = require("express");
const multer = require("multer");
const moment = require("moment-timezone");
const pool = require("../src/db");
const authenticateToken = require("../src/authMiddleware");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/data", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nama, no_hp, lokasi FROM request_data"
    );
    res.json(result.rows); // Use `result.rows` for PostgreSQL
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post(
  "/submit",
  upload.fields([{ name: "fileSurat" }, { name: "foto" }]),
  async (req, res) => {
    const {
      nama,
      alamat,
      noHp,
      noWhatsapp,
      permintaan,
      detailPermintaan,
      lokasi,
    } = req.body;
    const fileSurat = req.files["fileSurat"]
      ? req.files["fileSurat"][0].buffer
      : null;
    const foto = req.files["foto"] ? req.files["foto"][0].buffer : null;

    const date = moment().tz("Asia/Jakarta").format("HH:mm, DD MMMM YYYY");

    try {
      await pool.query(
        `INSERT INTO request_data (
          nama, alamat, no_whatsapp, no_hp, permintaan, detail_permintaan, lokasi, surat, foto, status, date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Verifikasi', $10)`,
        [
          nama,
          alamat,
          noWhatsapp,
          noHp,
          permintaan,
          detailPermintaan,
          lokasi,
          fileSurat,
          foto,
          date,
        ]
      );
      res.status(200).json({ message: "Data submitted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
