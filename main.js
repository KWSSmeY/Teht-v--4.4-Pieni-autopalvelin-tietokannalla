const express = require("express");
const mysql = require("mysql");
const { port, host, database, user, password } = require("./config.json");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host,
  user,
  password,
  database,
});

db.connect((err) => {
  if (err) {
    console.error("Virhe tietokantaan yhdistäessä: " + err.message);
  } else {
    console.log("Tietokantayhteys luotu...");
  }
});
console.log("Moi");
// Palauttaa kaikki autot Json muodossa
app.get("/autot", (req, res) => {
  const query = "SELECT * FROM auto";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Virhe kyselyssä: " + err.message);
      res.status(500).json({ viesti: "Tietokantavirhe" });
    } else {
      res.json(result);
    }
  });
});

// Hakee tietyn auton id:n perusteella
app.get("/autot/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM auto WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Virhe kyselyssä: " + err.message);
      res.status(500).json({ viesti: "Tietokantavirhe" });
    } else {
      if (result.length > 0) {
        res.json(result);
      } else {
        res.status(404).json({ viesti: "Autoa ei löytynyt" });
      }
    }
  });
});

// Lisää uuden auton
app.post("/autot/uusi", (req, res) => {
  const { merkki, malli, vuosimalli, omistaja } = req.body;
  const query = "INSERT INTO auto (merkki, malli, vuosimalli, omistaja) VALUES (?, ?, ?, ?)";
  db.query(query, [merkki, malli, vuosimalli, omistaja], (err, result) => {
    if (err) {
      console.error("Virhe kyselyssä: " + err.message);
      res.status(500).json({ viesti: "Tietokantavirhe" });
    } else {
      res.json({ viesti: "Auto lisätty!", auto: { id: result.insertId, merkki, malli, vuosimalli, omistaja } });
    }
  });
});

// Muokkaa annetun auton tietoja
app.put("/autot/:id", (req, res) => {
  const id = req.params.id;
  const { merkki, malli, vuosimalli, omistaja } = req.body;
  const query = "UPDATE auto SET merkki = ?, malli = ?, vuosimalli = ?, omistaja = ? WHERE id = ?";
  db.query(query, [merkki, malli, vuosimalli, omistaja, id], (err, result) => {
    if (err) {
      console.error("Virhe kyselyssä: " + err.message);
      res.status(500).json({ viesti: "Tietokantavirhe" });
    } else {
      if (result.affectedRows > 0) {
        res.json({ viesti: "Auto päivitetty!" });
      } else {
        res.status(404).json({ viesti: "Autoa ei löytynyt" });
      }
    }
  });
});

// Poistaa tietyn auton
app.delete("/autot/poista/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM auto WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Virhe kyselyssä: " + err.message);
      res.status(500).json({ viesti: "Tietokantavirhe" });
    } else {
      if (result.affectedRows > 0) {
        res.json({ viesti: "Auto poistettu" });
      } else {
        res.status(404).json({ viesti: "Autoa ei löytynyt" });
      }
    }
  });
});

// Käynnistää serverin
app.listen(port, host, () => {
  console.log("Kuuntelee...");
});