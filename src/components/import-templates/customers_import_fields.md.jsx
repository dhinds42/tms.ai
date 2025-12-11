# Customer / Shipper Import Fields Reference

## Overview
Import customer/shipper records into TMS.ai. Each row represents one customer company.

---

## Required Fields Summary
✅ customer_name  
✅ primary_contact_name  
✅ primary_contact_email  
✅ primary_contact_phone  

---

## Field Definitions

### customer_name ⭐ | customer_code | primary_contact_name ⭐ | primary_contact_email ⭐ | primary_contact_phone ⭐
- Company name (2-100 chars) | Internal account code | Main contact person | Contact email | Contact phone (10+ digits)

### Shipping Address
shipping_address_line1 | shipping_city | shipping_state | shipping_postal_code | shipping_country

### Billing Address  
billing_address_line1 | billing_city | billing_state | billing_postal_code | billing_country | billing_same_as_shipping

### Business Terms
payment_terms | credit_limit | credit_approved | industry | preferred_equipment_types | is_active | notes

---

## Sample Valid Row
```csv
customer_name,primary_contact_name,primary_contact_email,primary_contact_phone,shipping_city,shipping_state,payment_terms,credit_limit,is_active
XYZ Manufacturing,Jane Doe,shipping@xyz.com,(555) 987-6543,Los Angeles,CA,net_30,50000,true
``