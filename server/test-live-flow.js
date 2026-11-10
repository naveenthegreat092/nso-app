// Simulating two separate phones over the internet via Render
const BASE_URL = 'https://nso-app-md32.onrender.com/api';

async function run() {
  console.log('=== STEP 1: Friend (Phone 1: +91 9988776655) submits Service Provider Application ===');
  
  // Submit provider application directly over internet
  const appRes = await fetch(`${BASE_URL}/applications/provider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-phone': '9988776655'
    },
    body: JSON.stringify({
      applicantName: 'Ramesh Kumar (Electrician)',
      applicantPhone: '9988776655',
      tradeCategory: 'Electrician & Wireman',
      experienceYears: 5,
      hourlyRate: 350,
      serviceArea: 'Whitefield & Indiranagar, Bengaluru',
      resumeText: '5 years certified electrical maintenance and wiring work.',
      previousWork: 'Wiring for 20+ residential apartments in Whitefield.',
      idProofType: 'Aadhaar Card',
      idProofNumber: '5421-9876-1234'
    })
  });

  const appData = await appRes.json();
  console.log('Friend application submission response:', appRes.status, appData);
  if (!appRes.ok) throw new Error('Submission failed: ' + JSON.stringify(appData));
  const appId = appData.applicationId;

  console.log('\n=== STEP 2: Admin (Phone 2: +91 8310421121) logs in and checks Approvals ===');
  // Admin fetches applications with x-admin-phone header
  const adminGetRes = await fetch(`${BASE_URL}/applications`, {
    headers: {
      'x-admin-phone': '8310421121'
    }
  });

  const applications = await adminGetRes.json();
  console.log('Admin fetched applications count:', applications.length);
  const foundApp = applications.find(a => a.id === appId || a.applicantPhone === '9988776655');
  console.log('Found submitted application in Admin queue:', foundApp);

  if (!foundApp) {
    throw new Error('Application was not found in Admin queue on Render!');
  }

  console.log('\n=== STEP 3: Admin Approves the Service Provider Application ===');
  const approveRes = await fetch(`${BASE_URL}/applications/${foundApp.id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-phone': '8310421121'
    },
    body: JSON.stringify({
      approved: true,
      adminNotes: 'Verified ID document and certification.'
    })
  });

  const approveData = await approveRes.json();
  console.log('Approval response:', approveRes.status, approveData);

  console.log('\n=== STEP 4: Friend checks their status on Phone 1 ===');
  // Check user profile for friend on Render
  const friendRes = await fetch(`${BASE_URL}/users`, {
    headers: { 'x-admin-phone': '8310421121' }
  });
  const users = await friendRes.json();
  const friendUser = users.find(u => u.phone.includes('9988776655'));
  console.log('Friend updated user record on server:', friendUser);

  // Check application list again
  const refreshedApps = await (await fetch(`${BASE_URL}/applications`, { headers: { 'x-admin-phone': '8310421121' } })).json();
  const updatedApp = refreshedApps.find(a => a.id === foundApp.id);
  console.log('Application status on server:', updatedApp.status, 'Issued Provider ID:', updatedApp.issuedProviderId);

  console.log('\n✅ ALL LIVE CLOUD TESTS PASSED SUCCESSFULLY OVER RENDER!');
}

run().catch(e => {
  console.error('❌ TEST FAILED:', e);
  process.exit(1);
});
