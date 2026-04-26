const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: true,
    allowedHeaders: ["Content-Type", "X-Staff-Id", "X-Staff-Password"],
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.send("Backend is running 🚀 — open /home.html for the site.");
});

app.get("/test", (req, res) => {
  res.json({ message: "API working!" });
});

/** Lightweight health check for the frontend (CORS-friendly). */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * Sign-in: user → adopter.Adopter_ID + Password; admin → staff_account.
 * Re-import animal_shelter.sql (or npm run init-db) so Password columns exist.
 */
app.post("/auth/login", (req, res) => {
  const role = (req.body && req.body.role) || "user";
  const loginId = String((req.body && req.body.loginId) || "").trim();
  const password = String((req.body && req.body.password) || "");
  if (!loginId || !password) {
    return res.status(400).json({ error: "Enter your ID and password." });
  }
  if (role === "admin") {
    db.query(
      "SELECT Staff_ID FROM staff_account WHERE Staff_ID = ? AND Password = ?",
      [loginId, password],
      (err, rows) => {
        if (err)
          return res.status(500).json({ error: err.message || String(err) });
        if (!rows || !rows.length)
          return res
            .status(401)
            .json({ error: "Staff ID or password is not valid." });
        res.json({ ok: true, role: "admin", staffId: rows[0].Staff_ID });
      }
    );
    return;
  }
  db.query(
    "SELECT Adopter_ID FROM adopter WHERE Adopter_ID = ? AND Password = ?",
    [loginId, password],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      if (!rows || !rows.length)
        return res
          .status(401)
          .json({ error: "Adopter ID or password is not valid." });
      res.json({ ok: true, role: "user", adopterId: rows[0].Adopter_ID });
    }
  );
});

/** Only staff in `staff_account` may change or delete data (verified on each request). */
function requireStaff(req, res, next) {
  const id = String(req.get("x-staff-id") || "").trim();
  const pw = String(req.get("x-staff-password") || "");
  if (!id || !pw) {
    return res.status(403).json({
      error:
        "Only admin staff can modify or delete records. Log in as Admin, then retry with your Staff ID and password.",
    });
  }
  db.query(
    "SELECT Staff_ID FROM staff_account WHERE Staff_ID = ? AND Password = ? LIMIT 1",
    [id, pw],
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      if (!rows || !rows.length)
        return res.status(403).json({ error: "Invalid staff ID or password." });
      next();
    }
  );
}

// MySQL — optional override: DB_PASSWORD, DB_USER, DB_HOST, DB_NAME

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password:
    process.env.DB_PASSWORD !== undefined
      ? process.env.DB_PASSWORD
      : "Shraddha@07",
  database: process.env.DB_NAME || "animal_shelter",
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to DB:", err.message);
    if (err.code === "ER_BAD_DB_ERROR") {
      console.error(
        "Database is missing. Run once: npm run init-db\n" +
          "Or import animal_shelter.sql in MySQL Workbench (File → Run SQL Script)."
      );
    }
  } else {
    console.log("Connected to MySQL!");
    /** Older DBs may lack tables/columns added after first import — apply idempotently. */
    db.query(
      "CREATE TABLE IF NOT EXISTS staff_account (" +
        "Staff_ID varchar(20) NOT NULL," +
        "Password varchar(200) NOT NULL," +
        "PRIMARY KEY (Staff_ID)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
      (e1) => {
        if (e1) {
          console.error("Could not ensure staff_account table:", e1.message);
          return;
        }
        db.query(
          "INSERT IGNORE INTO staff_account (Staff_ID, Password) VALUES ('ADMIN', 'admin123')",
          (e2) => {
            if (e2)
              console.error("Could not seed staff_account:", e2.message);
          }
        );
      }
    );
    db.query(
      "ALTER TABLE adopter ADD COLUMN Password varchar(200) NULL",
      (e3) => {
        if (e3 && e3.code !== "ER_DUP_FIELDNAME") {
          console.error("Could not ensure adopter.Password column:", e3.message);
        }
      }
    );
    db.query(
      "ALTER TABLE pet ADD COLUMN Image_URL varchar(512) NULL",
      (e4) => {
        if (e4 && e4.code !== "ER_DUP_FIELDNAME") {
          console.error("Could not ensure pet.Image_URL column:", e4.message);
        }
      }
    );
    db.query(
      "CREATE TABLE IF NOT EXISTS volunteer_history (" +
        "History_ID varchar(10) NOT NULL," +
        "Volunteer_ID varchar(10) NOT NULL," +
        "Organization_Name varchar(200) NULL," +
        "Work_Summary varchar(500) NULL," +
        "Start_Date date NULL," +
        "End_Date date NULL," +
        "Hours_Total int NULL," +
        "Reference_Contact varchar(150) NULL," +
        "Notes varchar(500) NULL," +
        "PRIMARY KEY (History_ID)," +
        "KEY Volunteer_ID (Volunteer_ID)," +
        "CONSTRAINT volunteer_history_ibfk_1 FOREIGN KEY (Volunteer_ID) REFERENCES volunteer (Volunteer_ID)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci",
      (e5) => {
        if (e5) {
          console.error(
            "Could not ensure volunteer_history table:",
            e5.message
          );
        }
      }
    );
  }
});

/** Next varchar PKs for schema in animal_shelter.sql (P001, MR001, APP01, …) */
function nextPetId(cb) {
  db.query(
    "SELECT Pet_ID FROM pet WHERE Pet_ID REGEXP '^P[0-9]+$' ORDER BY CAST(SUBSTRING(Pet_ID, 2) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Pet_ID) {
        n = parseInt(String(rows[0].Pet_ID).slice(1), 10) + 1;
      }
      cb(null, "P" + String(n).padStart(3, "0"));
    }
  );
}
function nextMedicalRecordId(cb) {
  db.query(
    "SELECT Record_ID FROM medical_record WHERE Record_ID REGEXP '^MR[0-9]+$' ORDER BY CAST(SUBSTRING(Record_ID, 3) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Record_ID) {
        n = parseInt(String(rows[0].Record_ID).slice(2), 10) + 1;
      }
      cb(null, "MR" + String(n).padStart(3, "0"));
    }
  );
}
function nextAdopterId(cb) {
  db.query(
    "SELECT Adopter_ID FROM adopter WHERE Adopter_ID REGEXP '^A[0-9]+$' ORDER BY CAST(SUBSTRING(Adopter_ID, 2) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Adopter_ID) {
        n = parseInt(String(rows[0].Adopter_ID).slice(1), 10) + 1;
      }
      cb(null, "A" + String(n).padStart(3, "0"));
    }
  );
}
function nextDonorId(cb) {
  db.query(
    "SELECT Donor_ID FROM donor WHERE Donor_ID REGEXP '^D[0-9]+$' ORDER BY CAST(SUBSTRING(Donor_ID, 2) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Donor_ID) {
        n = parseInt(String(rows[0].Donor_ID).slice(1), 10) + 1;
      }
      cb(null, "D" + String(n).padStart(3, "0"));
    }
  );
}
function nextApplicationId(cb) {
  db.query(
    "SELECT Application_ID FROM adoption_application WHERE Application_ID REGEXP '^APP[0-9]+$' ORDER BY CAST(SUBSTRING(Application_ID, 4) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Application_ID) {
        n = parseInt(String(rows[0].Application_ID).slice(3), 10) + 1;
      }
      cb(null, "APP" + String(n).padStart(2, "0"));
    }
  );
}
function nextDonationId(cb) {
  db.query(
    "SELECT Donation_ID FROM donates WHERE Donation_ID REGEXP '^DON[0-9]+$' ORDER BY CAST(SUBSTRING(Donation_ID, 4) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].Donation_ID) {
        n = parseInt(String(rows[0].Donation_ID).slice(3), 10) + 1;
      }
      cb(null, "DON" + String(n).padStart(3, "0"));
    }
  );
}
function nextVolunteerHistoryId(cb) {
  db.query(
    "SELECT History_ID FROM volunteer_history WHERE History_ID REGEXP '^VH[0-9]+$' ORDER BY CAST(SUBSTRING(History_ID, 3) AS UNSIGNED) DESC LIMIT 1",
    (e, rows) => {
      if (e) return cb(e);
      let n = 1;
      if (rows && rows[0] && rows[0].History_ID) {
        n = parseInt(String(rows[0].History_ID).slice(2), 10) + 1;
      }
      cb(null, "VH" + String(n).padStart(3, "0"));
    }
  );
}

// example: fetching Pets from the database
app.get("/pets", (req, res) => {
  db.query(
    "SELECT * FROM pet WHERE Adoption_status IS NULL OR Adoption_status != 'Deleted' ORDER BY Pet_ID ASC",
    (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.json(result);
    }
  });
});

// add new pet (table `pet` — animal_shelter.sql)
app.post("/pets", requireStaff, (req, res) => {
  const data = { ...req.body };
  if (!data.Rescue_Date) {
    data.Rescue_Date = new Date().toISOString().slice(0, 10);
  }
  const insert = () => {
    db.query("INSERT INTO pet SET ?", data, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message || String(err) });
      } else {
        res.json({
          ok: true,
          insertId: result.insertId,
          Pet_ID: data.Pet_ID,
          message: "Pet added successfully",
        });
      }
    });
  };
  const assignIdAndInsert = () => {
    if (data.Pet_ID) return insert();
    nextPetId((e, id) => {
      if (e) return res.status(500).json({ error: e.message || String(e) });
      data.Pet_ID = id;
      insert();
    });
  };
  const sid = data.Shelter_ID ? String(data.Shelter_ID).trim() : "";
  if (!sid) {
    return assignIdAndInsert();
  }
  db.query(
    "SELECT Capacity FROM shelter WHERE Shelter_ID = ?",
    [sid],
    (e1, r1) => {
      if (e1)
        return res.status(500).json({ error: e1.message || String(e1) });
      if (!r1 || !r1.length)
        return res.status(400).json({ error: "Unknown Shelter_ID." });
      const cap = r1[0].Capacity;
      db.query(
        "SELECT COUNT(*) AS c FROM pet WHERE Shelter_ID = ?",
        [sid],
        (e2, r2) => {
          if (e2)
            return res.status(500).json({ error: e2.message || String(e2) });
          const count = r2 && r2[0] ? Number(r2[0].c) || 0 : 0;
          if (cap != null && count >= Number(cap)) {
            return res.status(409).json({
              error:
                "This shelter is full. Add the pet to another shelter or free a slot.",
              code: "SHELTER_FULL",
              Shelter_ID: sid,
            });
          }
          assignIdAndInsert();
        }
      );
    }
  );
});

// update pet
app.put("/pets/:id", requireStaff, (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const sql = "UPDATE pet SET ? WHERE Pet_ID = ?";
  db.query(sql, [data, id], (err, result) => {
    if (err) {
      res.send("Error updating pet");
    } else {
      res.send("Pet updated successfully");
    }
  });
});

// delete pet and related records, but keep adoption application history intact
app.delete("/pets/:id", requireStaff, (req, res) => {
  const id = req.params.id;

  db.beginTransaction((txErr) => {
    if (txErr) {
      return res.status(500).json({
        error: txErr.message || String(txErr)
      });
    }

    // Delete adoption applications first (fix foreign key issue)
    db.query(
      "DELETE FROM adoption_application WHERE Pet_ID = ?",
      [id],
      (appErr) => {
        if (appErr) {
          return db.rollback(() => {
            res.status(500).json({
              error: appErr.message || String(appErr)
            });
          });
        }

        // Delete medical records
        db.query(
          "DELETE FROM medical_record WHERE Pet_ID = ?",
          [id],
          (medErr) => {
            if (medErr) {
              return db.rollback(() => {
                res.status(500).json({
                  error: medErr.message || String(medErr)
                });
              });
            }

            // Delete volunteer assignments
            db.query(
              "DELETE FROM cares_for WHERE Pet_ID = ?",
              [id],
              (careErr) => {
                if (careErr) {
                  return db.rollback(() => {
                    res.status(500).json({
                      error: careErr.message || String(careErr)
                    });
                  });
                }

                // Finally delete pet
                db.query(
                  "DELETE FROM pet WHERE Pet_ID = ?",
                  [id],
                  (petErr, result) => {
                    if (petErr) {
                      return db.rollback(() => {
                        res.status(500).json({
                          error: petErr.message || String(petErr)
                        });
                      });
                    }

                    if (result.affectedRows === 0) {
                      return db.rollback(() => {
                        res.status(404).json({
                          error: "Pet not found"
                        });
                      });
                    }

                    db.commit((commitErr) => {
                      if (commitErr) {
                        return db.rollback(() => {
                          res.status(500).json({
                            error: commitErr.message || String(commitErr)
                          });
                        });
                      }

                      res.json({
                        ok: true,
                        message: "Pet deleted permanently"
                      });
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});


// shelter APIs
app.get("/shelters", (req, res) => {
  db.query("SELECT * FROM shelter", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message || String(err) });
    }
    res.json(Array.isArray(result) ? result : []);
  });
});

/** Occupancy per shelter (Capacity vs current pet count). */
app.get("/shelters/summary", (req, res) => {
  db.query(
    "SELECT s.Shelter_ID, s.Shelter_Name, s.Address, s.Phone, s.Capacity, " +
      "(SELECT COUNT(*) FROM pet p WHERE p.Shelter_ID = s.Shelter_ID) AS Pet_Count " +
      "FROM shelter s ORDER BY s.Shelter_ID ASC",
    (err, rows) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      const list = (Array.isArray(rows) ? rows : []).map((r) => {
        const cap =
          r.Capacity != null && r.Capacity !== ""
            ? Number(r.Capacity)
            : null;
        const cnt = Number(r.Pet_Count) || 0;
        const avail =
          cap != null && !isNaN(cap) ? Math.max(0, cap - cnt) : null;
        return {
          ...r,
          Available_Slots: avail,
          Is_Full: cap != null && !isNaN(cap) ? cnt >= cap : false,
        };
      });
      res.json(list);
    }
  );
});

app.post("/shelters", requireStaff, (req, res) => {
  db.query("INSERT INTO shelter SET ?", req.body, (err) => {
    if (err) res.send(err);
    else res.send("Shelter added");
  });
});

app.put("/shelters/:id", requireStaff, (req, res) => {
  db.query("UPDATE shelter SET ? WHERE Shelter_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Shelter updated");
    });
});

app.delete("/shelters/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM shelter WHERE Shelter_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Shelter deleted");
    });
});

// medical record APIs (optional ?Pet_ID= for one pet)
app.get("/medical", (req, res) => {
  const petId = String(
    (req.query && (req.query.Pet_ID || req.query.pet_id)) || ""
  ).trim();
  const sql = petId
    ? "SELECT * FROM medical_record WHERE Pet_ID = ? ORDER BY Checkup_Date DESC, Record_ID DESC"
    : "SELECT * FROM medical_record ORDER BY Pet_ID ASC, Checkup_Date DESC";
  const params = petId ? [petId] : [];
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message || String(err) });
    res.json(Array.isArray(result) ? result : []);
  });
});

app.post("/medical", requireStaff, (req, res) => {
  const data = { ...req.body };
  const insert = () => {
    db.query("INSERT INTO medical_record SET ?", data, (err, result) => {
      if (err) res.status(500).json({ error: err.message || String(err) });
      else
        res.json({
          ok: true,
          insertId: result.insertId,
          Record_ID: data.Record_ID,
          message: "Record added",
        });
    });
  };
  if (data.Record_ID) return insert();
  nextMedicalRecordId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.Record_ID = id;
    insert();
  });
});

app.put("/medical/:id", requireStaff, (req, res) => {
  db.query("UPDATE medical_record SET ? WHERE Record_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Record updated");
    });
});

app.delete("/medical/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM medical_record WHERE Record_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Record deleted");
    });
});

// adopter APIs
app.get("/adopters", (req, res) => {
  db.query("SELECT * FROM adopter", (err, result) => {
    if (err) res.send(err);
    else res.json(result);
  });
});

app.post("/adopters", (req, res) => {
  const data = { ...req.body };
  const insert = () => {
    db.query("INSERT INTO adopter SET ?", data, (err, result) => {
      if (err) res.status(500).json({ error: err.message || String(err) });
      else
        res.json({
          ok: true,
          insertId: result.insertId,
          Adopter_ID: data.Adopter_ID,
          message: "Adopter added",
        });
    });
  };
  if (data.Adopter_ID) return insert();
  nextAdopterId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.Adopter_ID = id;
    insert();
  });
});

app.put("/adopters/:id", requireStaff, (req, res) => {
  db.query("UPDATE adopter SET ? WHERE Adopter_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Adopter updated");
    });
});

app.delete("/adopters/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM adopter WHERE Adopter_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Adopter deleted");
    });
});

// adoption application APIs (optional ?Pet_ID= or ?Status=)
app.get("/applications", (req, res) => {
  const petId = String(
    (req.query && (req.query.Pet_ID || req.query.pet_id)) || ""
  ).trim();
  const status = String(
    (req.query && (req.query.Status || req.query.status)) || ""
  ).trim();
  const clauses = [];
  const params = [];
  if (petId) {
    clauses.push("Pet_ID = ?");
    params.push(petId);
  }
  if (status) {
    clauses.push("Status = ?");
    params.push(status);
  }
  const where = clauses.length ? " WHERE " + clauses.join(" AND ") : "";
  db.query(
    "SELECT * FROM adoption_application" +
      where +
      " ORDER BY Application_Date DESC, Application_ID DESC",
    params,
    (err, result) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      res.json(Array.isArray(result) ? result : []);
    }
  );
});

app.post("/applications", requireStaff, (req, res) => {
  const data = { ...req.body };
  const insert = () => {
    db.query("INSERT INTO adoption_application SET ?", data, (err, result) => {
      if (err) res.status(500).json({ error: err.message || String(err) });
      else
        res.json({
          ok: true,
          insertId: result.insertId,
          Application_ID: data.Application_ID,
          message: "Application added",
        });
    });
  };
  if (data.Application_ID) return insert();
  nextApplicationId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.Application_ID = id;
    insert();
  });
});

app.put("/applications/:id", requireStaff, (req, res) => {
  db.query("UPDATE adoption_application SET ? WHERE Application_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Application updated");
    });
});

app.delete("/applications/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM adoption_application WHERE Application_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Application deleted");
    });
});

// volunteer APIs
app.get("/volunteers", (req, res) => {
  db.query("SELECT * FROM volunteer", (err, result) => {
    if (err) res.send(err);
    else res.json(result);
  });
});

app.post("/volunteers", requireStaff, (req, res) => {
  db.query("INSERT INTO volunteer SET ?", req.body, (err) => {
    if (err) res.send(err);
    else res.send("Volunteer added");
  });
});

app.put("/volunteers/:id", (req, res) => {
  db.query("UPDATE volunteer SET ? WHERE Volunteer_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Volunteer updated");
    });
});

app.delete("/volunteers/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM volunteer WHERE Volunteer_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Volunteer deleted");
    });
});

// cares for APIs
app.get("/caresfor", (req, res) => {
  db.query("SELECT * FROM cares_for", (err, result) => {
    if (err) res.send(err);
    else res.json(result);
  });
});

app.post("/caresfor", requireStaff, (req, res) => {
  db.query("INSERT INTO cares_for SET ?", req.body, (err) => {
    if (err) res.send(err);
    else res.send("Assigned successfully");
  });
});

app.delete("/caresfor/:vid/:pid", requireStaff, (req, res) => {
  db.query(
    "DELETE FROM cares_for WHERE Volunteer_ID = ? AND Pet_ID = ?",
    [req.params.vid, req.params.pid],
    (err) => {
      if (err) res.send(err);
      else res.send("Deleted successfully");
    }
  );
});

// volunteer prior experience (organization, dates, hours, reference)
app.get("/volunteer-history", (req, res) => {
  const vid = String(
    (req.query && (req.query.Volunteer_ID || req.query.volunteer_id)) || ""
  ).trim();
  const sql = vid
    ? "SELECT * FROM volunteer_history WHERE Volunteer_ID = ? ORDER BY Start_Date DESC, History_ID DESC"
    : "SELECT * FROM volunteer_history ORDER BY Volunteer_ID ASC, Start_Date DESC";
  const params = vid ? [vid] : [];
  db.query(sql, params, (err, result) => {
    if (err)
      return res.status(500).json({ error: err.message || String(err) });
    res.json(Array.isArray(result) ? result : []);
  });
});

app.post("/volunteer-history", requireStaff, (req, res) => {
  const data = { ...req.body };
  const insert = () => {
    db.query("INSERT INTO volunteer_history SET ?", data, (err, result) => {
      if (err) return res.status(500).json({ error: err.message || String(err) });
      res.json({
        ok: true,
        insertId: result.insertId,
        History_ID: data.History_ID,
        message: "Volunteer history added",
      });
    });
  };
  if (data.History_ID) return insert();
  nextVolunteerHistoryId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.History_ID = id;
    insert();
  });
});

app.put("/volunteer-history/:id", requireStaff, (req, res) => {
  db.query(
    "UPDATE volunteer_history SET ? WHERE History_ID = ?",
    [req.body, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      res.json({ ok: true, message: "Volunteer history updated" });
    }
  );
});

app.delete("/volunteer-history/:id", requireStaff, (req, res) => {
  db.query(
    "DELETE FROM volunteer_history WHERE History_ID = ?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      res.json({ ok: true, message: "Volunteer history deleted" });
    }
  );
});

// donor APIs
app.get("/donors", (req, res) => {
  db.query("SELECT * FROM donor", (err, result) => {
    if (err) res.send(err);
    else res.json(result);
  });
});

app.post("/donors", requireStaff, (req, res) => {
  const data = { ...req.body };
  if (data.Name && !data.Donor_Name) data.Donor_Name = data.Name;
  const insert = () => {
    db.query("INSERT INTO donor SET ?", data, (err, result) => {
      if (err) res.status(500).json({ error: err.message || String(err) });
      else
        res.json({
          ok: true,
          insertId: result.insertId,
          Donor_ID: data.Donor_ID,
          message: "Donor added",
        });
    });
  };
  if (data.Donor_ID) return insert();
  nextDonorId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.Donor_ID = id;
    insert();
  });
});

app.put("/donors/:id", requireStaff, (req, res) => {
  db.query("UPDATE donor SET ? WHERE Donor_ID = ?", 
    [req.body, req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Donor updated");
    });
});

app.delete("/donors/:id", requireStaff, (req, res) => {
  db.query("DELETE FROM donor WHERE Donor_ID = ?", 
    [req.params.id], (err) => {
      if (err) res.send(err);
      else res.send("Donor deleted");
    });
});

// donates APIs (optional ?Shelter_ID= or ?Donor_ID=)
app.get("/donations", (req, res) => {
  const sid = String(
    (req.query && (req.query.Shelter_ID || req.query.shelter_id)) || ""
  ).trim();
  const did = String(
    (req.query && (req.query.Donor_ID || req.query.donor_id)) || ""
  ).trim();
  const clauses = [];
  const params = [];
  if (sid) {
    clauses.push("Shelter_ID = ?");
    params.push(sid);
  }
  if (did) {
    clauses.push("Donor_ID = ?");
    params.push(did);
  }
  const where = clauses.length ? " WHERE " + clauses.join(" AND ") : "";
  db.query(
    "SELECT * FROM donates" + where + " ORDER BY Date DESC, Donation_ID DESC",
    params,
    (err, result) => {
      if (err)
        return res.status(500).json({ error: err.message || String(err) });
      res.json(Array.isArray(result) ? result : []);
    }
  );
});

app.post("/donations", requireStaff, (req, res) => {
  const data = { ...req.body };
  if (data.Designation && !data.Purpose) data.Purpose = data.Designation;
  if (data.Donation_Date && !data.Date) data.Date = data.Donation_Date;
  const insert = () => {
    db.query("INSERT INTO donates SET ?", data, (err, result) => {
      if (err) res.status(500).json({ error: err.message || String(err) });
      else
        res.json({
          ok: true,
          insertId: result.insertId,
          Donation_ID: data.Donation_ID,
          message: "Donation recorded",
        });
    });
  };
  if (data.Donation_ID) return insert();
  nextDonationId((e, id) => {
    if (e) return res.status(500).json({ error: e.message || String(e) });
    data.Donation_ID = id;
    insert();
  });
});

app.delete("/donations/:did/:sid", requireStaff, (req, res) => {
  db.query(
    "DELETE FROM donates WHERE Donor_ID = ? AND Shelter_ID = ?",
    [req.params.did, req.params.sid],
    (err) => {
      if (err) res.send(err);
      else res.send("Deleted successfully");
    }
  );
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000 (API + static files)");
});