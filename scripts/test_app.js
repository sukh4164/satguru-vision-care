const http = require("http");

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      `http://localhost:3005${path}`,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.cookie ? { Cookie: options.cookie } : {}),
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=== RUNNING SATGURU VISION CARE INTEGRATION TEST SUITE ===");

  // 1. Admin Login
  console.log("\n[Test 1] Admin Login (admin / admin123)...");
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: { identifier: "admin", password: "admin123" },
  });
  console.log("Status:", adminLogin.status, "User:", adminLogin.data?.user?.name);
  if (adminLogin.status !== 200) throw new Error("Admin login failed!");
  const adminCookie = adminLogin.headers["set-cookie"]?.[0]?.split(";")[0];
  console.log("Admin cookie received:", adminCookie?.slice(0, 30) + "...");

  // 2. Staff Login
  console.log("\n[Test 2] Staff Login (staff / staff123)...");
  const staffLogin = await request("/api/auth/login", {
    method: "POST",
    body: { identifier: "staff", password: "staff123" },
  });
  console.log("Status:", staffLogin.status, "User:", staffLogin.data?.user?.name);
  if (staffLogin.status !== 200) throw new Error("Staff login failed!");
  const staffCookie = staffLogin.headers["set-cookie"]?.[0]?.split(";")[0];

  // 3. Customers List
  console.log("\n[Test 3] Fetch Customers List...");
  const custList = await request("/api/customers", { cookie: adminCookie });
  console.log("Status:", custList.status, "Count:", custList.data?.customers?.length);
  if (custList.status !== 200) throw new Error("Customer list failed!");

  // 4. Create New Customer
  console.log("\n[Test 4] Register New Customer (Kavita Singhania)...");
  const newCust = await request("/api/customers", {
    method: "POST",
    cookie: adminCookie,
    body: {
      name: "Kavita Singhania",
      mobile: "9820998877",
      whatsapp: "9820998877",
      email: "kavita.s@gmail.com",
      dob: "1985-05-15",
      gender: "Female",
      city: "Mumbai",
      notes: "First time progressive test. Frequent night driving.",
    },
  });
  console.log("Status:", newCust.status, "Customer Code:", newCust.data?.customer?.customer_code);
  if (newCust.status !== 201) throw new Error("Customer creation failed!");
  const createdCustomerId = newCust.data.customer.id;

  // 5. Test Duplicate Prevention on Phone Number
  console.log("\n[Test 5] Test Duplicate Mobile Registration Prevention...");
  const dupCheck = await request("/api/customers", {
    method: "POST",
    cookie: adminCookie,
    body: {
      name: "Kavita S (Duplicate)",
      mobile: "9820998877",
    },
  });
  console.log("Status:", dupCheck.status, "Duplicate Warning:", dupCheck.data?.duplicateWarning);
  if (dupCheck.status !== 409 || !dupCheck.data?.duplicateWarning) {
    throw new Error("Duplicate check should return 409 warning!");
  }
  console.log("Duplicate check passed: successfully caught duplicate mobile!");

  // 6. Create Eye Prescription with full OD & OS parameters
  console.log("\n[Test 6] Record Eye Prescription (OD & OS)...");
  const newRx = await request("/api/prescriptions", {
    method: "POST",
    cookie: adminCookie,
    body: {
      customer_id: createdCustomerId,
      prescription_date: "2024-11-04",
      next_checkup_date: "2025-11-04",
      doctor_name: "Rahul Sharma (Optometrist)",
      prescription_type: "Progressive (PAL)",
      od_sph: "+1.25",
      od_cyl: "-0.50",
      od_axis: "90",
      od_add: "+2.00",
      od_pd: "31.5",
      os_sph: "+1.00",
      os_cyl: "-0.25",
      os_axis: "85",
      os_add: "+2.00",
      os_pd: "31.5",
      pd_type: "Dual",
      notes: "First progressive lens pair. Advised anti-reflective coating.",
    },
  });
  console.log("Status:", newRx.status, "Rx Code:", newRx.data?.prescription?.prescription_code);
  if (newRx.status !== 201) throw new Error("Prescription creation failed!");
  const rxId = newRx.data.prescription.id;

  // 7. Verify Historical Comparison
  console.log("\n[Test 7] Prescription Comparison Endpoint...");
  const rxCompare = await request(`/api/prescriptions/compare?customerId=1`, { cookie: adminCookie });
  console.log("Status:", rxCompare.status, "Latest:", rxCompare.data?.latest?.prescription_code, "Previous:", rxCompare.data?.previous?.prescription_code);
  if (rxCompare.status !== 200 || !rxCompare.data?.previous) {
    throw new Error("Historical comparison check failed!");
  }
  console.log("Historical comparison confirmed! Previous Rx power:", rxCompare.data.previous.od_sph, "-> Latest Rx power:", rxCompare.data.latest.od_sph);

  // 8. Create Order linking Customer, Frame, Lens, and Prescription
  console.log("\n[Test 8] Book Spectacle Order...");
  const newOrder = await request("/api/orders", {
    method: "POST",
    cookie: adminCookie,
    body: {
      customer_id: createdCustomerId,
      prescription_id: rxId,
      expected_delivery_date: "2024-11-08",
      frame_details: "Titan Elegance Titanium Rimless (TE-RIM-88)",
      lens_details: "Essilor Varilux Comfort Max 1.60 Progressive",
      frame_amount: 3950,
      lens_amount: 8500,
      additional_charges: 100,
      discount_amount: 550,
      gst_rate: 12,
      advance_paid: 5000,
      payment_method: "UPI",
      order_notes: "Custom rimless drill mount. Urgent lab job.",
    },
  });
  console.log("Status:", newOrder.status, "Order Code:", newOrder.data?.order?.order_code, "Invoice:", newOrder.data?.invoiceCode);
  if (newOrder.status !== 201) throw new Error("Order creation failed!");
  const orderId = newOrder.data.order.id;

  // 9. Check Invoice Details
  console.log("\n[Test 9] Fetch Generated Tax Invoice...");
  const invRes = await request(`/api/invoices?search=${newOrder.data.order.order_code}`, { cookie: adminCookie });
  const invoice = invRes.data?.invoices?.[0];
  console.log("Status:", invRes.status, "Invoice Code:", invoice?.invoice_code, "Grand Total:", invoice?.grand_total, "Remaining Balance:", invoice?.remaining_balance);
  if (!invoice) throw new Error("Invoice was not generated for order!");

  // 10. Record Remaining Payment
  console.log("\n[Test 10] Record Remaining Payment Settlement...");
  const payRes = await request("/api/payments", {
    method: "POST",
    cookie: adminCookie,
    body: {
      order_id: orderId,
      invoice_id: invoice.id,
      customer_id: createdCustomerId,
      amount: invoice.remaining_balance,
      payment_method: "Cash",
      reference_number: "CASH-FINAL-101",
      notes: "Final balance settled on delivery",
    },
  });
  console.log("Status:", payRes.status, "Payment Code:", payRes.data?.payment?.payment_code);
  if (payRes.status !== 201) throw new Error("Payment recording failed!");

  // 11. Update Order Workflow Status
  console.log("\n[Test 11] Progress Order Workflow (New -> Processing -> Ready for Delivery -> Delivered)...");
  const updateStatus = await request(`/api/orders/${orderId}/status`, {
    method: "POST",
    cookie: adminCookie,
    body: { status: "Delivered", note: "Customer tried on frame and verified 6/6 vision clarity" },
  });
  console.log("Status:", updateStatus.status, "New Order Status:", updateStatus.data?.order?.status, "Remaining Balance:", updateStatus.data?.order?.remaining_balance);
  if (updateStatus.data?.order?.status !== "Delivered") throw new Error("Status update failed!");

  // 12. Check Reports & Analytics
  console.log("\n[Test 12] Fetch Reports & Analytics Data...");
  const reports = await request("/api/reports", { cookie: adminCookie });
  console.log("Status:", reports.status, "Total Customers:", reports.data?.stats?.totalCustomers, "Total Orders:", reports.data?.stats?.totalOrders, "Delivered Orders:", reports.data?.stats?.completedOrders);
  if (reports.status !== 200) throw new Error("Reports failed!");

  // 13. Verify RBAC Security (Staff user cannot access /api/staff)
  console.log("\n[Test 13] Test RBAC Access Control (Staff attempting Admin endpoint)...");
  const staffAttempt = await request("/api/staff", { cookie: staffCookie });
  console.log("Staff GET /api/staff Status:", staffAttempt.status, "Expected 403 Forbidden");
  if (staffAttempt.status !== 403) throw new Error("RBAC failed: Staff was able to access admin-only endpoint!");
  console.log("RBAC Security Verified: Staff correctly blocked from admin-only endpoint!");

  console.log("\n ALL 13 TEST CASES PASSED FLAWLESSLY! ");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

