const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Request = require('./models/Request');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vpa_employee_portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedAdmin();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Seed admin account if not exists
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ employeeId: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        employeeId: 'admin',
        name: 'System Administrator',
        gmail: 'admin@vpa.gov.in',
        password: hashedPassword,
        isAdmin: true
      });
      console.log('IT Administrator account auto-seeded successfully.');
    }
  } catch (err) {
    console.error('Error auto-seeding admin user:', err);
  }
}

// ══════════════════ AUTHENTICATION ROUTES ══════════════════

// SIGN UP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { employeeId, name, gmail, password, designation, aadhaarNumber, mobile } = req.body;
    
    // Check missing fields
    if (!employeeId || !name || !gmail || !password || !designation || !aadhaarNumber || !mobile) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check duplicate
    const existingUser = await User.findOne({ 
      $or: [
        { employeeId: employeeId.toLowerCase() },
        { gmail: gmail.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID or Gmail address is already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      employeeId: employeeId.toLowerCase(),
      name,
      gmail: gmail.toLowerCase(),
      password: hashedPassword,
      designation,
      aadhaarNumber,
      mobile,
      isAdmin: false
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// LOG IN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and Password are required' });
    }

    const user = await User.findOne({ employeeId: userId.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Employee ID/Username or Password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Employee ID/Username or Password' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});


// ══════════════════ USER DIRECTORY ROUTES ══════════════════

// GET ALL USERS (Admin only)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// DELETE EMPLOYEE (Admin only)
app.delete('/api/users/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const deletedUser = await User.findOneAndDelete({ employeeId: employeeId.toLowerCase() });
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Also remove requests associated with this employee
    await Request.deleteMany({ employeeId: employeeId.toLowerCase() });

    res.json({ message: 'Employee and their requests deleted successfully' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Server error deleting employee' });
  }
});


// ══════════════════ SERVICE REQUESTS ROUTES ══════════════════

// GET ALL OR FILTERED REQUESTS
app.get('/api/requests', async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    if (employeeId) {
      query.employeeId = employeeId.toLowerCase();
    }
    const requests = await Request.find(query);
    res.json(requests);
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ error: 'Server error fetching requests' });
  }
});

// CREATE NEW REQUEST
app.post('/api/requests', async (req, res) => {
  try {
    const { employeeId, employeeName, category, subRequest, formData, date } = req.body;

    if (!employeeId || !category || !subRequest || !date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate unique Ticket ID
    const ticketId = 'VPA-REQ-' + Math.floor(10000 + Math.random() * 90000);

    const newRequest = await Request.create({
      ticketId,
      employeeId: employeeId.toLowerCase(),
      employeeName,
      category,
      subRequest,
      formData: formData || {},
      date,
      status: 'Pending'
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error creating request' });
  }
});

// UPDATE REQUEST STATUS
app.put('/api/requests/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, resolutionRemarks, resolutionData } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateFields = { status };
    if (resolutionRemarks !== undefined) updateFields.resolutionRemarks = resolutionRemarks;
    if (resolutionData !== undefined) updateFields.resolutionData = resolutionData;

    const updatedRequest = await Request.findOneAndUpdate(
      { ticketId },
      updateFields,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request ticket not found' });
    }

    if (status === 'Resolved') {
      try {
        const user = await User.findOne({ employeeId: updatedRequest.employeeId });
        if (user) {
          const { subRequest } = updatedRequest;
          const dataToApply = resolutionData || updatedRequest.formData || {};

          if (subRequest === 'Name Change' && dataToApply.newName) {
            user.name = dataToApply.newName;
            if (dataToApply.govtId) {
              user.aadhaarNumber = dataToApply.govtId;
            }
          } else if (subRequest === 'Aadhaar Change' && dataToApply.newAadhaar) {
            user.aadhaarNumber = dataToApply.newAadhaar;
          } else if (subRequest === 'Designation Update' && dataToApply.newDesignation) {
            user.designation = dataToApply.newDesignation;
          } else if (subRequest === 'Contact Details') {
            if (dataToApply.mobile) user.mobile = dataToApply.mobile;
            if (dataToApply.address) user.address = dataToApply.address;
            if (dataToApply.emergencyContact) user.emergencyContact = dataToApply.emergencyContact;
            if (dataToApply.emergencyMobile) user.emergencyMobile = dataToApply.emergencyMobile;
          } else if (subRequest === 'Email Updation' && dataToApply.newEmail) {
            user.gmail = dataToApply.newEmail;
          }
          await user.save();
          console.log(`Auto-applied finalized profile updates for employee ${user.employeeId} upon resolving ticket ${ticketId}.`);
        }
      } catch (userErr) {
        console.error('Error auto-applying profile updates to User:', userErr);
      }
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

// DELETE SINGLE REQUEST
app.delete('/api/requests/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const deletedRequest = await Request.findOneAndDelete({ ticketId });

    if (!deletedRequest) {
      return res.status(404).json({ error: 'Request ticket not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Server error deleting request' });
  }
});

// CLEAR ALL REQUESTS (Admin only)
app.delete('/api/requests/clear-all', async (req, res) => {
  try {
    await Request.deleteMany({});
    res.json({ message: 'All requests deleted successfully' });
  } catch (err) {
    console.error('Clear all requests error:', err);
    res.status(500).json({ error: 'Server error clearing requests' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
