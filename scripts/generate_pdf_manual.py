#!/usr/bin/env python3
import os
import base64
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
LOGO_PATH = os.path.join(PROJECT_DIR, "public", "logo.png")
OUTPUT_HTML = os.path.join(PROJECT_DIR, "Satguru_Vision_Care_User_Manual.html")
OUTPUT_PDF_ROOT = os.path.join(PROJECT_DIR, "Satguru_Vision_Care_User_Manual.pdf")
OUTPUT_PDF_PUBLIC = os.path.join(PROJECT_DIR, "public", "Satguru_Vision_Care_User_Manual.pdf")

# Convert logo to base64
logo_b64 = ""
if os.path.exists(LOGO_PATH):
    with open(LOGO_PATH, "rb") as f:
        logo_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<title>Satguru Vision Care - यूज़र गाइड व ऑपरेटिंग मैनुअल</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

  @page {{
    size: A4 portrait;
    margin: 15mm 15mm 18mm 15mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    font-size: 11pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  /* Page Break Utilities */
  .page-break {{
    page-break-after: always;
    break-after: page;
  }}

  .avoid-break {{
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  /* Header banner */
  .cover-banner {{
    background: linear-gradient(135deg, #001f35 0%, #002d4b 60%, #0284c7 100%);
    color: white;
    padding: 28px 28px;
    border-radius: 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 31, 53, 0.25);
  }}

  .cover-logo {{
    width: 90px;
    height: 90px;
    background: #ffffff;
    border-radius: 16px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }}

  .cover-logo img {{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }}

  .cover-text h1 {{
    font-size: 23pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.15;
    margin-bottom: 4px;
    color: #ffffff;
  }}

  .cover-text .tagline {{
    font-size: 10.5pt;
    font-weight: 600;
    color: #7dd3fc;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }}

  .cover-text .domain-badge {{
    display: inline-block;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 9pt;
    font-weight: 700;
    color: #e0f2fe;
    letter-spacing: 0.3px;
  }}

  /* Section styles */
  .section {{
    margin-bottom: 22px;
  }}

  .section-header {{
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 12px;
  }}

  .section-num {{
    background: #002d4b;
    color: white;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 10pt;
    flex-shrink: 0;
  }}

  .section-title {{
    font-size: 13.5pt;
    font-weight: 800;
    color: #002d4b;
    letter-spacing: -0.3px;
  }}

  /* Flow Steps */
  .flow-container {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin: 14px 0 18px 0;
  }}

  .flow-step {{
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 12px;
    padding: 10px 8px;
    text-align: center;
    position: relative;
  }}

  .flow-step.active {{
    background: #f0f9ff;
    border-color: #0284c7;
  }}

  .step-badge {{
    background: #0284c7;
    color: white;
    font-size: 7.5pt;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
    margin-bottom: 4px;
    text-transform: uppercase;
  }}

  .step-title {{
    font-size: 8.5pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.25;
  }}

  .step-desc {{
    font-size: 7.5pt;
    color: #64748b;
    margin-top: 2px;
  }}

  /* Cards */
  .card-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 12px 0;
  }}

  .info-card {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
  }}

  .info-card.primary {{
    background: #f0f9ff;
    border-color: #bae6fd;
  }}

  .info-card.success {{
    background: #ecfdf5;
    border-color: #a7f3d0;
  }}

  .info-card.warning {{
    background: #fffbeb;
    border-color: #fde68a;
  }}

  .card-title {{
    font-size: 10pt;
    font-weight: 800;
    color: #002d4b;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9pt;
  }}

  th {{
    background: #002d4b;
    color: white;
    text-align: left;
    padding: 8px 10px;
    font-weight: 700;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  td {{
    padding: 7px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
  }}

  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}

  /* Badges & highlights */
  .badge {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 8pt;
  }}

  .badge-blue {{ background: #e0f2fe; color: #0369a1; }}
  .badge-green {{ background: #dcfce7; color: #15803d; }}
  .badge-purple {{ background: #f3e8ff; color: #7e22ce; }}
  .badge-amber {{ background: #fef3c7; color: #b45309; }}

  .dns-code {{
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background: #0f172a;
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 600;
  }}

  ul, ol {{
    padding-left: 20px;
    margin: 6px 0;
  }}

  li {{
    margin-bottom: 4px;
    color: #334155;
  }}

  li strong {{
    color: #0f172a;
  }}

  .footer-note {{
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #cbd5e1;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #64748b;
    font-weight: 600;
  }}

  .callout {{
    border-left: 4px solid #0284c7;
    background: #f0f9ff;
    padding: 10px 14px;
    border-radius: 0 8px 8px 0;
    margin: 10px 0;
    font-size: 9.5pt;
  }}
</style>
</head>
<body>

  <!-- PAGE 1 -->
  <!-- Top Banner -->
  <div class="cover-banner">
    <div class="cover-logo">
      <img src="{logo_b64}" alt="Satguru Vision Care Logo">
    </div>
    <div class="cover-text">
      <div class="tagline">Eye Care • Eye Wear • Better Vision</div>
      <h1>SATGURU VISION CARE</h1>
      <p style="font-size: 11pt; color: #e0f2fe; margin-bottom: 8px;">
        ऑप्टिकल स्टोर व आई-क्लिनिक कम्प्यूटराइज़्ड ऑपरेटिंग मैनुअल (SOP)
      </p>
      <div>
        <span class="domain-badge">🌐 Official Live Domain: satguruvisioncare.com</span>
      </div>
    </div>
  </div>

  <!-- Quick Workflow Diagram -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">★</div>
      <div class="section-title">दुकान का 5-स्टेप डेली वर्कफ़्लो (Daily Customer Cycle)</div>
    </div>
    <div class="flow-container">
      <div class="flow-step active">
        <span class="step-badge">स्टेप 1</span>
        <div class="step-title">ग्राहक जोड़ें</div>
        <div class="step-desc">New Customer पेज पर मोबाइल व नाम भरें</div>
      </div>
      <div class="flow-step active">
        <span class="step-badge">स्टेप 2</span>
        <div class="step-title">आँख का टेस्ट</div>
        <div class="step-desc">OD/OS SPH, CYL, AXIS पावर दर्ज करें</div>
      </div>
      <div class="flow-step active">
        <span class="step-badge">स्टेप 3</span>
        <div class="step-title">ऑर्डर बुक करें</div>
        <div class="step-desc">फ्रेम, लेंस व एडवांस पेमेंट लें</div>
      </div>
      <div class="flow-step active">
        <span class="step-badge">स्टेप 4</span>
        <div class="step-title">बिल व WhatsApp</div>
        <div class="step-desc">पक्का GST इनवॉइस व WhatsApp रसीद भेजें</div>
      </div>
      <div class="flow-step active">
        <span class="step-badge">स्टेप 5</span>
        <div class="step-title">चश्मा डिलीवरी</div>
        <div class="step-desc">बाकी बैलेंस लें और ऑर्डर क्लोज करें</div>
      </div>
    </div>
  </div>

  <!-- 1. Login Details -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">1</div>
      <div class="section-title">सॉफ्टवेयर में लॉगिन कैसे करें?</div>
    </div>
    <p style="margin-bottom: 8px;">
      ब्राउज़र में <strong>https://satguruvisioncare.com/login</strong> खोलें (लोकल टेस्टिंग के लिए <code>http://localhost:3000/login</code>):
    </p>
    <div class="card-grid">
      <div class="info-card primary">
        <div class="card-title">
          <span class="badge badge-blue">Store Owner</span>
          दुकान मालिक (Sukhvender Singh)
        </div>
        <ul style="font-size: 9pt; padding-left: 16px;">
          <li><strong>यूज़रनेम:</strong> <code>sukhbendarsingh</code></li>
          <li><strong>पासवर्ड:</strong> <code>sukh@4164</code></li>
          <li><strong>ईमेल:</strong> <code>sukh4164@gmail.com</code> | <strong>फ़ोन:</strong> <code>+91 98708 33033</code></li>
          <li><strong>अधिकार:</strong> पूरी दुकान का नियंत्रण, दैनिक बिक्री/गल्ला, GST सेटिंग्स व स्टाफ मैनेजमेंट।</li>
        </ul>
      </div>

      <div class="info-card">
        <div class="card-title">
          <span class="badge badge-green">Staff Access</span>
          स्टाफ अकाउंट्स (कर्मचारी व ऑप्टोमेट्रिस्ट)
        </div>
        <ul style="font-size: 9pt; padding-left: 16px;">
          <li><strong>स्टाफ जोड़ना:</strong> दुकान मालिक <em>Staff Management</em> मेनू से नया स्टाफ खाता कभी भी बना सकते हैं।</li>
          <li><strong>अधिकार:</strong> ग्राहक रजिस्ट्रेशन, आई टेस्टिंग, चश्मा ऑर्डर बुकिंग, बिल प्रिंटिंग व बैलेंस जमा करना।</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 2. Customer Registration -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">2</div>
      <div class="section-title">नया ग्राहक जोड़ना (Customer Registration)</div>
    </div>
    <p>जब कोई नया व्यक्ति दुकान पर आता है, तो ऊपर हेडर में <strong>New Customer</strong> बटन दबाएँ (यह सीधे <code>/dashboard/customers/new</code> पेज खोलता है):</p>
    <ol style="font-size: 9.5pt; margin-top: 6px;">
      <li><strong>ग्राहक का नाम:</strong> जैसे <em>Rameshwar Patel</em></li>
      <li><strong>मोबाइल नंबर (10 अंक):</strong> जैसे <em>9820012345</em></li>
      <li><strong>DOB / उम्र:</strong> जन्मतिथि चुनते ही उम्र अपने आप निकल आती है।</li>
      <li><strong>स्मार्ट डुप्लीकेट अलर्ट:</strong> यदि यह नंबर पहले से सिस्टम में दर्ज है, तो सॉफ्टवेयर तुरंत स्क्रीन पर अलर्ट देकर उसका पुराना रिकॉर्ड खोल देगा।</li>
      <li>नीचे <strong>"Register & Add Eye Prescription (Rx)"</strong> बटन दबाएँ। ग्राहक सेव होते ही सीधे आँख चेकअप का पेज खुल जाएगा।</li>
    </ol>
  </div>

  <!-- 3. Eye Power & History Comparison -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">3</div>
      <div class="section-title">आँख का पावर और पुराना इतिहास देखना (Power Comparison)</div>
    </div>
    <div class="callout">
      <strong>🌟 सबसे बड़ा फायदा:</strong> जब कोई पुराना ग्राहक 6 महीने या 1 साल बाद आता है, तो सर्च बार में सिर्फ उसका मोबाइल नंबर या नाम डालें। उसकी प्रोफाइल में <strong>पिछला पावर और नया पावर आमने-सामने</strong> तुलना में दिखेगा, जिससे तुरंत पता चल जाएगा कि पावर घटा या बढ़ा है!
    </div>
    <table>
      <thead>
        <tr>
          <th>Eye (आँख)</th>
          <th>SPH (Spherical)</th>
          <th>CYL (Cylindrical)</th>
          <th>AXIS (कोण)</th>
          <th>ADD (Addition)</th>
          <th>PD (दूरी)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>OD (Right Eye - दायाँ)</strong></td>
          <td>-1.50</td>
          <td>-0.50</td>
          <td>90°</td>
          <td>+1.75</td>
          <td>31 mm</td>
        </tr>
        <tr>
          <td><strong>OS (Left Eye - बायाँ)</strong></td>
          <td>-1.25</td>
          <td>-0.75</td>
          <td>180°</td>
          <td>+1.75</td>
          <td>31 mm</td>
        </tr>
      </tbody>
    </table>
    <p style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">
      * Prescription Type चुनें: Distance (दूर), Reading (पास), Progressive/Bifocal (धूप-छांव) या Blue-cut (कंप्यूटर)।
    </p>
  </div>

  <div class="footer-note">
    <span>SATGURU VISION CARE • satguruvisioncare.com</span>
    <span>पेज 1 / 3</span>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- PAGE 2 -->
  <!-- 4. Orders & Invoicing -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">4</div>
      <div class="section-title">चश्मा ऑर्डर और पक्का GST बिल (Tax Invoice)</div>
    </div>
    <p>जब ग्राहक फ्रेम और लेंस पसंद कर ले:</p>
    <ol style="font-size: 9.5pt; margin-top: 6px;">
      <li>साइडबार में <strong>Orders ➔ + New Order</strong> पर क्लिक करें।</li>
      <li><strong>ग्राहक व लेटेस्ट टेस्ट:</strong> कस्टमर और उसकी आँख का टेस्ट चुनें।</li>
      <li><strong>फ्रेम व लेंस सेलेक्ट करें:</strong> स्टॉक में से फ्रेम चुनते ही इन्वेंटरी में से 1 पीस खुद-ब-खुद कम हो जाता है।</li>
      <li><strong>कीमत व डिस्काउंट:</strong> फ्रेम और लेंस का रेट डालें। GST (12% या 18%) अपने आप जुड़ जाएगा।</li>
      <li><strong>एडवांस पेमेंट (Advance):</strong> ग्राहक ने जितने रुपये Cash, UPI (GPay/PhonePe) या Card से दिए, वो डालें। बाकी बैलेंस (Remaining Due) अपने आप दिखेगा।</li>
      <li><strong>1-Click WhatsApp रसीद:</strong> बिल बनते ही <strong>"Send on WhatsApp"</strong> बटन दबाएँ। ग्राहक के फोन पर बिल नंबर, कुल रकम, एडवांस और बाकी बकाया का सुन्दर मैसेज चला जाएगा!</li>
      <li><strong>Print Invoice:</strong> A4 साइज़ या POS थर्मल रसीद प्रिंटर से 1-क्लिक में पक्का बिल निकालें जिसमें आपकी दुकान का <strong>असली SV लोगो</strong>, पता, GSTIN और <strong>satguruvisioncare.com</strong> प्रिंट होगा।</li>
    </ol>
  </div>

  <!-- 5. Payments & Balance Settlement -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">5</div>
      <div class="section-title">बाकी पेमेंट जमा करना और डिलीवरी (Delivery & Balance)</div>
    </div>
    <div class="card-grid">
      <div class="info-card success">
        <div class="card-title">बाकी पैसे कैसे लें?</div>
        <p style="font-size: 8.5pt; color: #334155;">
          जब ग्राहक 3 दिन बाद चश्मा लेने आए:
        </p>
        <ul style="font-size: 8.5pt; padding-left: 14px; margin-top: 4px;">
          <li>सर्च बार में उसका मोबाइल नंबर डालें।</li>
          <li><strong>"+ Record Payment"</strong> बटन दबाएँ।</li>
          <li>जमा रकम डालें (जैसे ₹1,200 UPI)।</li>
          <li>सेव करते ही इनवॉइस का स्टेटस <strong>"PAID"</strong> हो जाएगा।</li>
        </ul>
      </div>

      <div class="info-card warning">
        <div class="card-title">Follow-ups & Recalls (याद दिलाने की लिस्ट)</div>
        <p style="font-size: 8.5pt; color: #334155;">
          साइडबार में <strong>Follow-ups</strong> मेनू में जाएँ:
        </p>
        <ul style="font-size: 8.5pt; padding-left: 14px; margin-top: 4px;">
          <li><strong>Delivery Ready:</strong> जो चश्मे तैयार हैं, उन्हें कॉल करें।</li>
          <li><strong>Pending Balance:</strong> जिन पर बकाया है, उन्हें याद दिलाएँ।</li>
          <li><strong>Eye Checkup Due:</strong> 1 साल पुराने ग्राहकों को दोबारा चेकअप के लिए बुलाएँ।</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 6. Inventory & Stock Management -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">6</div>
      <div class="section-title">स्टॉक और इन्वेंटरी मैनेजमेंट (Products & Stock)</div>
    </div>
    <p style="font-size: 9.5pt;">
      साइडबार में <strong>Products & Stock</strong> पर जाकर आप दुकान का सारा माल दर्ज कर सकते हैं:
    </p>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Brands</th>
          <th>फीचर्स व फायदे</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Optical Frames</strong></td>
          <td>Ray-Ban, Fastrack, Titan, Generic</td>
          <td>ब्रांड, मॉडल नंबर, खरीद रेट, बिक्री रेट व बारकोड</td>
        </tr>
        <tr>
          <td><strong>Ophthalmic Lenses</strong></td>
          <td>Crizal, Essilor, Blue-Cut, Polycarbonate</td>
          <td>सिंगल विज़न, बाइफोकल, प्रोग्रेसिव लेंस पेयर स्टॉक</td>
        </tr>
        <tr>
          <td><strong>Low Stock Alert</strong></td>
          <td>ऑटोमैटिक लाल चेतावनी</td>
          <td>जब भी किसी मॉडल के 3 या 5 से कम पीस बचेंगे, तो डैशबोर्ड आपको सचेत कर देगा ताकि आप डिस्ट्रीब्यूटर से नया माल मँगवा सकें।</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 7. Reports & Daily Cash (Admin) -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">7</div>
      <div class="section-title">दैनिक गल्ला और हिसाब-किताब (Reports & Analytics)</div>
    </div>
    <p style="font-size: 9.5pt;">
      यह स्क्रीन केवल <strong>Admin (मालिक)</strong> को दिखती है:
    </p>
    <ul style="font-size: 9pt;">
      <li><strong>आज की कुल बिक्री (Today's Total Sales):</strong> आज कितने का चश्मा बिका और गल्ले में कितना Cash/UPI आया।</li>
      <li><strong>मार्केट में कुल बकाया (Total Market Due):</strong> ग्राहकों के पास कुल कितना पैसा रुका हुआ है और किन-किन ग्राहकों पर कितना बकाया है (फोन नंबर सहित लिस्ट)।</li>
      <li><strong>कर्मचारियों का काम:</strong> किस कर्मचारी ने आज कितने टेस्ट किए और कितने ऑर्डर बुक किए।</li>
    </ul>
  </div>

  <div class="footer-note">
    <span>SATGURU VISION CARE • satguruvisioncare.com</span>
    <span>पेज 2 / 3</span>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- PAGE 3 -->
  <!-- 8. Domain Connection Guide -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">8</div>
      <div class="section-title">अपना डोमेन (satguruvisioncare.com) लाइव कैसे जोड़ें?</div>
    </div>
    <p style="font-size: 9.5pt;">
      आपकी वेबसाइट और Turso क्लाउड डेटाबेस पूरी तरह तैयार है। अपने डोमेन <strong>satguruvisioncare.com</strong> को लाइव जोड़ने के लिए केवल 2 आसान कदम उठाने हैं:
    </p>

    <div class="card-grid" style="margin-top: 10px;">
      <div class="info-card primary">
        <div class="card-title">विकल्प A: Vercel पर लाइव करना (सबसे आसान)</div>
        <ol style="font-size: 8.5pt; padding-left: 14px;">
          <li><strong>vercel.com</strong> पर जाएँ और अपने GitHub अकाउंट से <em>satguru-vision-care</em> रिपोजिटरी को Import करें।</li>
          <li><strong>Environment Variables</strong> में ये 2 वैल्यू डालें:
            <br>• <code>TURSO_DATABASE_URL</code>
            <br>• <code>TURSO_AUTH_TOKEN</code>
          </li>
          <li><strong>Deploy</strong> पर क्लिक करें। 2 मिनट में साइट लाइव हो जाएगी।</li>
          <li><strong>Settings ➔ Domains</strong> में जाकर <code>satguruvisioncare.com</code> और <code>www.satguruvisioncare.com</code> जोड़ें।</li>
        </ol>
      </div>

      <div class="info-card">
        <div class="card-title">विकल्प B: Cloudflare Pages पर लाइव करना</div>
        <ol style="font-size: 8.5pt; padding-left: 14px;">
          <li><strong>dash.cloudflare.com</strong> ➔ <em>Workers & Pages</em> ➔ <em>Create application</em> ➔ <em>Pages</em> ➔ <em>Connect to Git</em>।</li>
          <li>Framework Preset में <strong>Next.js</strong> चुनें।</li>
          <li>Environment Variables में दोनों Turso कीज़ पेस्ट करें।</li>
          <li><strong>Custom Domains</strong> में जाकर <code>satguruvisioncare.com</code> जोड़ें। Cloudflare पर SSL (Green Lock) अपने आप चालू हो जाता है।</li>
        </ol>
      </div>
    </div>

    <div style="margin-top: 10px;">
      <div style="font-weight: 800; font-size: 10pt; color: #002d4b; margin-bottom: 6px;">
        📌 DNS रिकॉर्ड्स (GoDaddy / Namecheap / Hostinger पर क्या डालना है?):
      </div>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name (Host)</th>
            <th>Target / Value</th>
            <th>TTL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge-blue">A Record</span></td>
            <td><code>@</code></td>
            <td><span class="dns-code">76.76.21.21</span> (Vercel के लिए)</td>
            <td>Auto / 1 Hour</td>
          </tr>
          <tr>
            <td><span class="badge badge-green">CNAME</span></td>
            <td><code>www</code></td>
            <td><span class="dns-code">cname.vercel-dns.com</span> (या Cloudflare Pages URL)</td>
            <td>Auto</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 9. Quick Cheat Sheet -->
  <div class="section avoid-break">
    <div class="section-header">
      <div class="section-num">9</div>
      <div class="section-title">स्टाफ के लिए क्विक शॉर्टकट चीट-शीट</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>काम</th>
          <th>कहाँ क्लिक करें?</th>
          <th>शॉर्टकट / यूआरएल</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>नया कस्टमर जोड़ना</strong></td>
          <td>हेडर में <strong>"New Customer"</strong> बटन</td>
          <td><code>/dashboard/customers/new</code></td>
        </tr>
        <tr>
          <td><strong>आँख का पावर भरना</strong></td>
          <td>हेडर में <strong>"+ Add Prescription"</strong></td>
          <td><code>/dashboard/prescriptions/new</code></td>
        </tr>
        <tr>
          <td><strong>चश्मे का ऑर्डर बनाना</strong></td>
          <td>साइडबार ➔ <strong>Orders ➔ + New Order</strong></td>
          <td><code>/dashboard/orders/new</code></td>
        </tr>
        <tr>
          <td><strong>पुराना पावर खोजना</strong></td>
          <td>सबसे ऊपर सर्च बार में मोबाइल नंबर टाइप करें</td>
          <td>कस्टमर प्रोफाइल में तुलना दिखेगी</td>
        </tr>
        <tr>
          <td><strong>दुकान का आज का गल्ला</strong></td>
          <td>साइडबार ➔ <strong>Reports & Analytics</strong></td>
          <td><code>/dashboard/reports</code></td>
        </tr>
        <tr>
          <td><strong>दुकान का पता व GST बदलना</strong></td>
          <td>साइडबार ➔ <strong>Store Settings</strong></td>
          <td><code>/dashboard/settings</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Official Store Contact Box -->
  <div class="avoid-break" style="background: #f8fafc; border: 2px dashed #94a3b8; border-radius: 12px; padding: 12px 16px; margin-top: 14px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <div>
        <div style="font-weight: 800; color: #002d4b; font-size: 11pt;">SATGURU VISION CARE</div>
        <div style="font-size: 8.5pt; color: #64748b;">Delhi gate, Aligarh, Uttar Pradesh - 202001</div>
      </div>
      <div style="text-align: right; font-size: 8.5pt; color: #334155;">
        <div><strong>Official Website:</strong> <span style="color: #0284c7; font-weight: 700;">satguruvisioncare.com</span></div>
        <div><strong>Owner:</strong> Sukhvender Singh | <strong>Email:</strong> sukh4164@gmail.com | <strong>Mobile:</strong> +91 98708 33033</div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <span>SATGURU VISION CARE • Official Operations Manual v1.0 • satguruvisioncare.com</span>
    <span>पेज 3 / 3</span>
  </div>

</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML manual: {OUTPUT_HTML}")

# Compile to PDF using headless Chrome
chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={OUTPUT_PDF_ROOT}",
    f"file://{OUTPUT_HTML}"
]

print("Executing Chrome headless PDF generation...")
res = subprocess.run(cmd, capture_output=True, text=True)

if res.returncode == 0 and os.path.exists(OUTPUT_PDF_ROOT):
    # Copy to public folder
    import shutil
    shutil.copyfile(OUTPUT_PDF_ROOT, OUTPUT_PDF_PUBLIC)
    print(f"Successfully generated PDF: {OUTPUT_PDF_ROOT}")
    print(f"Copied to public downloadable asset: {OUTPUT_PDF_PUBLIC}")
    size = os.path.getsize(OUTPUT_PDF_ROOT)
    print(f"PDF File Size: {size} bytes")
else:
    print("Chrome execution error:")
    print(res.stderr)

