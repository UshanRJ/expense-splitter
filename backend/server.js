const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize SQLite database
const db = new sqlite3.Database('./expense_splitter.db');

// Create tables with party_date field
db.serialize(() => {
  // Events table with party_date
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_name TEXT NOT NULL,
    party_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add party_date column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE events ADD COLUMN party_date TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding party_date column:', err.message);
    }
  });

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    subcategory TEXT,
    amount REAL NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events (id)
  )`);

  // Attendees table
  db.run(`CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    contribution REAL DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events (id)
  )`);

  // Attendee category participation table
  db.run(`CREATE TABLE IF NOT EXISTS attendee_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendee_id INTEGER,
    category_id INTEGER,
    participates BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (attendee_id) REFERENCES attendees (id),
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);
});

// Routes

// Get all events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new event with party_date
app.post('/api/events', (req, res) => {
  const { party_name, party_date } = req.body;
  
  // Use current date if no party_date provided
  const eventDate = party_date || new Date().toISOString().split('T')[0];
  
  db.run('INSERT INTO events (party_name, party_date) VALUES (?, ?)', [party_name, eventDate], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, party_name, party_date: eventDate });
  });
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  const { party_name, party_date } = req.body;
  
  db.run('UPDATE events SET party_name = ?, party_date = ? WHERE id = ?', 
    [party_name, party_date, eventId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: eventId, party_name, party_date });
  });
});

// Delete event and all related data
app.delete('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  db.serialize(() => {
    db.run('DELETE FROM attendee_categories WHERE attendee_id IN (SELECT id FROM attendees WHERE event_id = ?)', [eventId]);
    db.run('DELETE FROM categories WHERE event_id = ?', [eventId]);
    db.run('DELETE FROM attendees WHERE event_id = ?', [eventId]);
    db.run('DELETE FROM events WHERE id = ?', [eventId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
  });
});

// Get event details with all related data
app.get('/api/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  // Get event details
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    // Get categories
    db.all('SELECT * FROM categories WHERE event_id = ?', [eventId], (err, categories) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get attendees
      db.all('SELECT * FROM attendees WHERE event_id = ?', [eventId], (err, attendees) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Get attendee category participation
        db.all(`
          SELECT ac.*, a.name as attendee_name, c.name as category_name 
          FROM attendee_categories ac
          JOIN attendees a ON ac.attendee_id = a.id
          JOIN categories c ON ac.category_id = c.id
          WHERE a.event_id = ?
        `, [eventId], (err, participations) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          res.json({
            event,
            categories,
            attendees,
            participations
          });
        });
      });
    });
  });
});

// Add category to event
app.post('/api/events/:id/categories', (req, res) => {
  const eventId = req.params.id;
  const { name, subcategory, amount } = req.body;
  
  db.run('INSERT INTO categories (event_id, name, subcategory, amount) VALUES (?, ?, ?, ?)', 
    [eventId, name, subcategory, amount], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, event_id: eventId, name, subcategory, amount });
  });
});

// Update category
app.put('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  const { name, subcategory, amount } = req.body;
  
  db.run('UPDATE categories SET name = ?, subcategory = ?, amount = ? WHERE id = ?', 
    [name, subcategory, amount, categoryId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: categoryId, name, subcategory, amount });
  });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  const categoryId = req.params.id;
  
  db.serialize(() => {
    db.run('DELETE FROM attendee_categories WHERE category_id = ?', [categoryId]);
    db.run('DELETE FROM categories WHERE id = ?', [categoryId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
  });
});

// Add attendee to event
app.post('/api/events/:id/attendees', (req, res) => {
  const eventId = req.params.id;
  const { name, contribution } = req.body;
  
  db.run('INSERT INTO attendees (event_id, name, contribution) VALUES (?, ?, ?)', 
    [eventId, name, contribution || 0], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, event_id: eventId, name, contribution: contribution || 0 });
  });
});

// Update attendee
app.put('/api/attendees/:id', (req, res) => {
  const attendeeId = req.params.id;
  const { name, contribution } = req.body;
  
  db.run('UPDATE attendees SET name = ?, contribution = ? WHERE id = ?', 
    [name, contribution || 0, attendeeId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: attendeeId, name, contribution: contribution || 0 });
  });
});

// Delete attendee
app.delete('/api/attendees/:id', (req, res) => {
  const attendeeId = req.params.id;
  
  db.serialize(() => {
    db.run('DELETE FROM attendee_categories WHERE attendee_id = ?', [attendeeId]);
    db.run('DELETE FROM attendees WHERE id = ?', [attendeeId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
  });
});

// Update attendee category participation
app.post('/api/attendee-categories', (req, res) => {
  const { attendee_id, category_id, participates } = req.body;
  
  // Check if record exists
  db.get('SELECT * FROM attendee_categories WHERE attendee_id = ? AND category_id = ?', 
    [attendee_id, category_id], (err, existing) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (existing) {
      // Update existing record
      db.run('UPDATE attendee_categories SET participates = ? WHERE attendee_id = ? AND category_id = ?',
        [participates, attendee_id, category_id], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      });
    } else {
      // Create new record
      db.run('INSERT INTO attendee_categories (attendee_id, category_id, participates) VALUES (?, ?, ?)',
        [attendee_id, category_id, participates], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      });
    }
  });
});

// Calculate expenses for an event
app.get('/api/events/:id/calculate', (req, res) => {
  const eventId = req.params.id;
  
  // Get all data for calculation
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all('SELECT * FROM categories WHERE event_id = ?', [eventId], (err, categories) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all('SELECT * FROM attendees WHERE event_id = ?', [eventId], (err, attendees) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.all(`
          SELECT * FROM attendee_categories ac
          JOIN attendees a ON ac.attendee_id = a.id
          WHERE a.event_id = ?
        `, [eventId], (err, participations) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          // Calculate expenses
          const calculations = calculateExpenses(attendees, categories, participations);
          
          res.json({
            event,
            categories,
            attendees,
            calculations
          });
        });
      });
    });
  });
});

// Export to Excel
app.get('/api/events/:id/export', (req, res) => {
  const eventId = req.params.id;
  
  // Get calculation data
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all('SELECT * FROM categories WHERE event_id = ?', [eventId], (err, categories) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.all('SELECT * FROM attendees WHERE event_id = ?', [eventId], (err, attendees) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.all(`
          SELECT * FROM attendee_categories ac
          JOIN attendees a ON ac.attendee_id = a.id
          WHERE a.event_id = ?
        `, [eventId], (err, participations) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          // Calculate expenses
          const calculations = calculateExpenses(attendees, categories, participations);
          
          // Create Excel workbook
          const wb = XLSX.utils.book_new();
          
          // Summary sheet
          const summaryData = [
            ['Event Name', event.party_name],
            ['Party Date', event.party_date],
            ['Total Attendees', attendees.length],
            ['Total Categories', categories.length],
            ['Generated On', new Date().toLocaleDateString()],
            [],
            ['Person', 'Total Expense', 'Contribution', 'Balance']
          ];
          
          Object.values(calculations).forEach(calc => {
            summaryData.push([
              calc.name,
              calc.totalExpense.toFixed(2),
              calc.contribution.toFixed(2),
              calc.balance.toFixed(2)
            ]);
          });
          
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
          
          // Detailed breakdown sheet
          const detailData = [['Person', 'Category', 'Amount', 'Participates']];
          
          attendees.forEach(attendee => {
            categories.forEach(category => {
              const participates = participations.find(p => 
                p.attendee_id === attendee.id && p.category_id === category.id && p.participates
              );
              const calc = calculations[attendee.id];
              const categoryExpense = calc ? (calc.categoryExpenses[category.name] || 0) : 0;
              
              detailData.push([
                attendee.name,
                category.name + (category.subcategory ? ` (${category.subcategory})` : ''),
                categoryExpense.toFixed(2),
                participates ? 'Yes' : 'No'
              ]);
            });
          });
          
          const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
          XLSX.utils.book_append_sheet(wb, detailSheet, 'Details');
          
          // Generate Excel file
          const filename = `${event.party_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_expenses.xlsx`;
          const filepath = path.join(__dirname, 'exports', filename);
          
          // Ensure exports directory exists
          const fs = require('fs');
          if (!fs.existsSync(path.join(__dirname, 'exports'))) {
            fs.mkdirSync(path.join(__dirname, 'exports'));
          }
          
          // Write file
          XLSX.writeFile(wb, filepath);
          
          // Send file
          res.download(filepath, filename, (err) => {
            if (err) {
              console.error('Error sending file:', err);
              res.status(500).json({ error: 'Failed to export file' });
            } else {
              // Clean up file after sending
              setTimeout(() => {
                fs.unlink(filepath, (err) => {
                  if (err) console.error('Error deleting temp file:', err);
                });
              }, 1000);
            }
          });
        });
      });
    });
  });
});

// Expense calculation logic
function calculateExpenses(attendees, categories, participations) {
  const attendeeExpenses = {};
  
  // Initialize attendee expenses
  attendees.forEach(attendee => {
    attendeeExpenses[attendee.id] = {
      name: attendee.name,
      contribution: attendee.contribution,
      categoryExpenses: {},
      totalExpense: 0,
      balance: 0
    };
  });
  
  // Calculate category-wise expenses
  categories.forEach(category => {
    const participatingAttendees = participations.filter(p => 
      p.category_id === category.id && p.participates === 1
    );
    
    if (participatingAttendees.length > 0) {
      const expensePerPerson = category.amount / participatingAttendees.length;
      
      participatingAttendees.forEach(participation => {
        const attendeeId = participation.attendee_id;
        attendeeExpenses[attendeeId].categoryExpenses[category.name] = expensePerPerson;
        attendeeExpenses[attendeeId].totalExpense += expensePerPerson;
      });
    }
  });
  
  // Calculate balances
  Object.keys(attendeeExpenses).forEach(attendeeId => {
    const expense = attendeeExpenses[attendeeId];
    expense.balance = expense.contribution - expense.totalExpense;
  });
  
  return attendeeExpenses;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});