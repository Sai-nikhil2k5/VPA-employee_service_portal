const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const Request = require('./models/Request');
const EmailLog = require('./models/EmailLog');
const LoginLog = require('./models/LoginLog');

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
    const superiorExists = await User.findOne({ employeeId: 'admin' });
    const assistantExists = await User.findOne({ employeeId: 'assistant' });
    
    if (!superiorExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        employeeId: 'admin',
        name: 'Superior Administrator',
        gmail: 'admin@vpa.gov.in',
        password: hashedPassword,
        isAdmin: true,
        adminLevel: 'superior'
      });
      console.log('Superior Administrator account auto-seeded successfully.');
    } else if (superiorExists.adminLevel !== 'superior') {
      superiorExists.adminLevel = 'superior';
      await superiorExists.save();
    }

    if (!assistantExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        employeeId: 'assistant',
        name: 'Assistant Administrator',
        gmail: 'assistant@vpa.gov.in',
        password: hashedPassword,
        isAdmin: true,
        adminLevel: 'assistant'
      });
      console.log('Assistant Administrator account auto-seeded successfully.');
    }
  } catch (err) {
    console.error('Error auto-seeding admin users:', err);
  }
}

// Nodemailer SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to get status background and text colors for HTML email
function getStatusColors(status) {
  switch (status) {
    case 'Resolved':
    case 'Approved':
      return { bg: '#dcfce7', text: '#15803d' };
    case 'Rejected':
      return { bg: '#fee2e2', text: '#b91c1c' };
    case 'In Progress':
      return { bg: '#eff6ff', text: '#1e40af' };
    case 'Escalated':
      return { bg: '#f3e8ff', text: '#7e22ce' };
    default:
      return { bg: '#fef9c3', text: '#a16207' };
  }
}

// Utility to send email notifications and log them in MongoDB
async function sendStatusEmail(user, request) {
  const ticketId = request.ticketId;
  const status = request.status;
  const category = request.category;
  const subRequest = request.subRequest;
  const resolutionRemarks = request.resolutionRemarks || '';
  const userName = user.name;
  const toEmail = user.gmail;

  const colors = getStatusColors(status);

  const subject = `[VPA Portal] Ticket ${ticketId} Status Update: ${status}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #0d3a5c; color: white; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">Visakhapatnam Port Authority</h2>
        <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.8;">Employee Services Portal</p>
      </div>
      <div style="padding: 24px; color: #333333; line-height: 1.6;">
        <p>Dear <strong>${userName}</strong>,</p>
        <p>The status of your service request has been updated by the system administrator.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0d3a5c; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #4b5563; width: 120px;">Ticket ID:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #0d3a5c;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #4b5563;">Category:</td>
              <td style="padding: 4px 0; color: #1f2937;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #4b5563;">Sub-Request:</td>
              <td style="padding: 4px 0; color: #1f2937;">${subRequest}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #4b5563;">New Status:</td>
              <td style="padding: 4px 0;">
                <span style="background-color: ${colors.bg}; color: ${colors.text}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                  ${status}
                </span>
              </td>
            </tr>
            ${resolutionRemarks ? `
            <tr>
              <td style="padding: 8px 0 4px; font-weight: bold; color: #4b5563; vertical-align: top;">Remarks:</td>
              <td style="padding: 8px 0 4px; color: #4b5563; font-style: italic;">${resolutionRemarks}</td>
            </tr>` : ''}
          </table>
        </div>
        
        <p>You can view more details or track this request by logging into the VPA Employee Services Portal.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  // Check if SMTP is configured
  const isSmtpConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isSmtpConfigured) {
    try {
      await transporter.sendMail({
        from: `"VPA Employee Portal" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });
      
      await EmailLog.create({
        to: toEmail,
        subject: subject,
        body: htmlContent,
        status: 'Sent'
      });
      console.log(`Email notification successfully sent to ${toEmail} for ticket ${ticketId}.`);
    } catch (error) {
      console.error(`Error sending email to ${toEmail} for ticket ${ticketId}:`, error);
      await EmailLog.create({
        to: toEmail,
        subject: subject,
        body: htmlContent,
        status: 'Failed',
        error: error.message
      });
    }
  } else {
    // Mock Mode
    console.log(`[MOCK EMAIL NOTIFICATION]
To: ${toEmail}
Subject: ${subject}
(Set EMAIL_USER & EMAIL_PASS in server/.env to enable live delivery)`);
    
    await EmailLog.create({
      to: toEmail,
      subject: subject,
      body: htmlContent,
      status: 'Mock Logged'
    });
  }
}

// ══════════════════ AUTHENTICATION ROUTES ══════════════════

// SIGN UP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { employeeId, name, gmail, password, designation, aadhaarNumber, mobile, emailNotificationsEnabled } = req.body;
    
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
      isAdmin: false,
      emailNotificationsEnabled: emailNotificationsEnabled !== undefined ? emailNotificationsEnabled : true
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
      await LoginLog.create({
        employeeId: userId.toLowerCase(),
        status: 'Failed',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(400).json({ error: 'Invalid Employee ID/Username or Password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await LoginLog.create({
        employeeId: user.employeeId,
        status: 'Failed',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });
      return res.status(400).json({ error: 'Invalid Employee ID/Username or Password' });
    }

    // Success log
    await LoginLog.create({
      employeeId: user.employeeId,
      status: 'Success',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

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

// UPDATE USER SETTINGS
app.put('/api/users/:employeeId/settings', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { emailNotificationsEnabled } = req.body;

    const user = await User.findOneAndUpdate(
      { employeeId: employeeId.toLowerCase() },
      { emailNotificationsEnabled },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Server error updating settings' });
  }
});

// GET EMAIL LOGS (Admin only)
app.get('/api/email-logs', async (req, res) => {
  try {
    const logs = await EmailLog.find({}).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Fetch email logs error:', err);
    res.status(500).json({ error: 'Server error fetching email logs' });
  }
});

// GET LOGIN LOGS (Admin only)
app.get('/api/login-logs', async (req, res) => {
  try {
    const logs = await LoginLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Fetch login logs error:', err);
    res.status(500).json({ error: 'Server error fetching login logs' });
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

    // Fetch user for possible auto-updates and/or email notifications
    const user = await User.findOne({ employeeId: updatedRequest.employeeId });

    if (user && status === 'Resolved') {
      try {
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
      } catch (userErr) {
        console.error('Error auto-applying profile updates to User:', userErr);
      }
    }

    // Trigger instant email updates if notification preference is enabled
    if (user && user.emailNotificationsEnabled !== false) {
      sendStatusEmail(user, updatedRequest).catch(emailErr => {
        console.error(`Failed to send status update email for ticket ${ticketId}:`, emailErr);
      });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Server error updating status' });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
