const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Machine = require('../models/Machine');
const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const Report = require('../models/Report');

dotenv.config({ path: '../.env' }); // Load from root if running from scripts directory
dotenv.config(); // fallback to current server folder .env

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sentinelai';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collection data...');
    await User.deleteMany();
    await Worker.deleteMany();
    await Machine.deleteMany();
    await Sensor.deleteMany();
    await Alert.deleteMany();
    await Incident.deleteMany();
    await Maintenance.deleteMany();
    await Report.deleteMany();

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Elena Rostova',
      email: 'admin@sentinel.ai',
      password: 'password123',
      role: 'Admin'
    });

    const officer = await User.create({
      name: 'Marcus Vance',
      email: 'officer@sentinel.ai',
      password: 'password123',
      role: 'Safety Officer'
    });

    const supervisor = await User.create({
      name: 'Karthik Rao',
      email: 'supervisor@sentinel.ai',
      password: 'password123',
      role: 'Supervisor'
    });

    console.log('Creating workers...');
    const w1 = await Worker.create({
      name: 'John Doe',
      employeeId: 'EMP-001',
      department: 'Refinement',
      role: 'Chemical Technician',
      status: 'Active',
      online: true,
      currentZone: 'Zone A',
      location: { x: 22, y: 35 },
      phone: '+1-555-0199'
    });

    const w2 = await Worker.create({
      name: 'Alice Smith',
      employeeId: 'EMP-002',
      department: 'Refinement',
      role: 'Safety Patrol',
      status: 'Active',
      online: true,
      currentZone: 'Zone B',
      location: { x: 55, y: 70 },
      phone: '+1-555-0144'
    });

    const w3 = await Worker.create({
      name: 'Bob Johnson',
      employeeId: 'EMP-003',
      department: 'Maintenance',
      role: 'Mechanical Lead',
      status: 'Active',
      online: true,
      currentZone: 'Zone B',
      location: { x: 62, y: 65 },
      phone: '+1-555-0112'
    });

    const w4 = await Worker.create({
      name: 'Sarah Connor',
      employeeId: 'EMP-004',
      department: 'Operations',
      role: 'Control Room Operator',
      status: 'Active',
      online: false,
      currentZone: 'Zone C',
      location: { x: 80, y: 25 },
      phone: '+1-555-0105'
    });

    console.log('Creating machinery...');
    const m1 = await Machine.create({
      name: 'Hydro-Cracking Reactor A',
      code: 'MCH-HCR01',
      type: 'Reactor Vessel',
      status: 'Operational',
      healthScore: 92,
      currentZone: 'Zone B',
      location: { x: 50, y: 65 },
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    const m2 = await Machine.create({
      name: 'High-Pressure Steam Boiler',
      code: 'MCH-BOI02',
      type: 'Boiler System',
      status: 'Operational',
      healthScore: 97,
      currentZone: 'Zone B',
      location: { x: 65, y: 75 },
      lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const m3 = await Machine.create({
      name: 'Nitrogen Gas Generator',
      code: 'MCH-GEN03',
      type: 'Gas Generator',
      status: 'Operational',
      healthScore: 88,
      currentZone: 'Zone A',
      location: { x: 25, y: 40 },
      lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    const m4 = await Machine.create({
      name: 'Catalytic Reformer Compressor',
      code: 'MCH-COM04',
      type: 'Centrifugal Compressor',
      status: 'Maintenance',
      healthScore: 78,
      currentZone: 'Zone C',
      location: { x: 80, y: 45 },
      lastMaintenance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    });

    console.log('Creating sensors...');
    // Sensor 1: Gas (Combustible CO/H2S) in Zone A
    const s1 = new Sensor({
      name: 'Gas Detector A1',
      code: 'SNS-GAS-A1',
      type: 'Gas',
      currentZone: 'Zone A',
      currentValue: 18.2, // ppm
      unit: 'ppm',
      status: 'Active',
      location: { x: 20, y: 30 }
    });
    s1.history.push({ value: 18.2, timestamp: new Date() });
    await s1.save();

    // Sensor 2: Temp in Zone B
    const s2 = new Sensor({
      name: 'Reactor Temp Probe B1',
      code: 'SNS-TMP-B1',
      type: 'Temperature',
      currentZone: 'Zone B',
      currentValue: 52.4, // C
      unit: '°C',
      status: 'Active',
      location: { x: 48, y: 62 }
    });
    s2.history.push({ value: 52.4, timestamp: new Date() });
    await s2.save();

    // Sensor 3: Pressure in Zone B
    const s3 = new Sensor({
      name: 'Steam Pressure Gauge B2',
      code: 'SNS-PRS-B2',
      type: 'Pressure',
      currentZone: 'Zone B',
      currentValue: 92.8, // PSI
      unit: 'PSI',
      status: 'Active',
      location: { x: 67, y: 72 }
    });
    s3.history.push({ value: 92.8, timestamp: new Date() });
    await s3.save();

    // Sensor 4: Humidity in Zone C
    const s4 = new Sensor({
      name: 'Humidity Monitor C1',
      code: 'SNS-HUM-C1',
      type: 'Humidity',
      currentZone: 'Zone C',
      currentValue: 48.5,
      unit: '%',
      status: 'Active',
      location: { x: 75, y: 20 }
    });
    s4.history.push({ value: 48.5, timestamp: new Date() });
    await s4.save();

    // Sensor 5: Smoke in Zone A
    const s5 = new Sensor({
      name: 'Smoke Sensor A2',
      code: 'SNS-SMK-A2',
      type: 'Smoke',
      currentZone: 'Zone A',
      currentValue: 0.1,
      unit: '%',
      status: 'Active',
      location: { x: 30, y: 45 }
    });
    s5.history.push({ value: 0.1, timestamp: new Date() });
    await s5.save();

    console.log('Creating work permits / maintenance logs...');
    // Work permit active in Zone B
    await Maintenance.create({
      machine: m1._id,
      worker: w3._id,
      description: 'Hot tapping piping maintenance under low load',
      type: 'Calibration',
      permitRequired: true,
      permitActive: true,
      permitNumber: 'PERMIT-2026-H045',
      status: 'In Progress',
      scheduledDate: new Date(),
      startDate: new Date()
    });

    // Scheduled maintenance in Zone C
    await Maintenance.create({
      machine: m4._id,
      worker: w3._id,
      description: 'Routine exhaust fan replacement',
      type: 'Routine',
      permitRequired: false,
      permitActive: false,
      status: 'Scheduled',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    console.log('Creating historical incidents...');
    await Incident.create({
      title: 'Minor Hydro-Carbon Flare Leak',
      description: 'Vent valve leak triggered methane alarm. Flare stack operated. Resolved by gasket replacement.',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      severity: 'Minor',
      zone: 'Zone B',
      rootCause: 'Elastomer seal erosion due to high pressure cycles',
      actionsTaken: 'Seals upgraded to reinforced Viton O-rings',
      status: 'Closed',
      reportedBy: officer._id
    });

    await Incident.create({
      title: 'Heat Stress Advisory - Shift A',
      description: 'Air cooling units failed in Zone B during summer peak. Ambient temperature reached 48°C. Two technicians reported fatigue.',
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      severity: 'Major',
      zone: 'Zone B',
      rootCause: 'Electrical fan breaker trip in substation 4',
      actionsTaken: 'Ambient monitors connected to SCADA backup alerts',
      status: 'Closed',
      reportedBy: supervisor._id
    });

    console.log('Creating initial safety alerts...');
    await Alert.create({
      title: 'Calibration Warning: Catalyst Level Low',
      description: 'Nitrogen gas generator level indicates minor divergence from target ratio.',
      severity: 'Low',
      zone: 'Zone A',
      sensor: s1._id,
      machine: m3._id,
      status: 'Active',
      riskScore: 28.5,
      recommendations: 'Recalibrate input valve during next scheduled shift inspection.'
    });

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
