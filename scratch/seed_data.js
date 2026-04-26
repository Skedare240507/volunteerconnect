const admin = require('firebase-admin');

// Initialize with project ID (Service Account should be automatically picked up in this environment)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'volunteer-connect-36b92'
  });
}

const db = admin.firestore();

async function seed() {
  const resources = [
    { title: "Emergency Medical Kit", type: "Aid", status: "open", urgency: "High", affectedCount: 15, locationName: "Hadapsar, Pune", location: { lat: 18.5089, lng: 73.9259 }, createdAt: new Date() },
    { title: "Potable Water (500L)", type: "Supply", status: "matched", urgency: "Medium", affectedCount: 50, locationName: "Kothrud, Pune", location: { lat: 18.5074, lng: 73.8077 }, createdAt: new Date() },
    { title: "Temporary Shelter Tents", type: "Infrastructure", status: "open", urgency: "High", affectedCount: 120, locationName: "Pimpri, Pune", location: { lat: 18.6298, lng: 73.7997 }, createdAt: new Date() },
    { title: "Volunteer Group - 5 Pax", type: "Skills", status: "broadcasting", urgency: "Low", affectedCount: 0, locationName: "Viman Nagar, Pune", location: { lat: 18.5679, lng: 73.9143 }, createdAt: new Date() },
  ];

  const tasks = [
    { title: "Deliver Kits to Hadapsar", coordinatorId: "VC-HCF-2025-001", status: "assigned", location: "Sector 4, Hadapsar", createdAt: new Date() },
    { title: "Install Water Filter", coordinatorId: "VC-HCF-2025-002", status: "in-progress", location: "Kothrud Depot", createdAt: new Date() },
  ];

  for (const r of resources) {
    await db.collection('resources').add(r);
  }
  for (const t of tasks) {
    await db.collection('tasks').add(t);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
