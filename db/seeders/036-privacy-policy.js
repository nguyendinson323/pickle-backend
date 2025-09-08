'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('privacy_policy', [
      // Initial privacy policy (version 1.0)
      {
        content: `# PRIVACY POLICY
## Mexican Pickleball Federation
### Version 1.0 - January 2023

## 1. GENERAL INFORMATION
The Mexican Pickleball Federation, located at [address], is responsible for the processing of your personal data.

## 2. PERSONAL DATA WE COLLECT
- Identification data: name, surname, date of birth
- Contact data: phone number, email address, address
- Work data: occupation, workplace
- Sports data: playing level, competitive history

## 3. PURPOSES OF PROCESSING
Your personal data will be used for:
- Registration and control of affiliates
- Organization of sporting events
- Communication of news and events
- Statistical purposes

## 4. DATA SUBJECT RIGHTS
You have the right to access, rectify, cancel or oppose the processing of your personal data.

## 5. CONTACT
To exercise your rights or resolve questions, contact: privacy@pickleballmexico.org

Effective date: January 15, 2023`,
        version: '1.0',
        is_active: false,
        created_at: new Date('2023-01-15 10:00:00')
      },
      
      // Updated policy (intermediate version)
      {
        content: `# PRIVACY POLICY
## Mexican Pickleball Federation
### Version 2.0 - August 2023

## 1. DATA CONTROLLER
The Mexican Pickleball Federation is responsible for the processing of your personal data in accordance with the Federal Law on Protection of Personal Data Held by Private Parties.

## 2. PERSONAL DATA COLLECTED
### Required data:
- Personal information: full name, CURP, RFC, date of birth
- Contact: address, phone number, email
- Identification: copy of official ID
- Sports: NTRP level, tournament history, ranking

### Optional data:
- Photographs for promotion
- Relevant medical information
- Emergency contact references

## 3. PRIMARY PURPOSES
- Registration and membership control
- Organization of official competitions
- Issuance of licenses and certifications
- Compliance with tax obligations

## 4. SECONDARY PURPOSES
- Sports marketing
- Statistics and performance analysis
- Sponsor communications
- Sport promotion

## 5. DATA TRANSFERS
We may share your data with:
- National and international sports authorities
- Official sponsors (with prior authorization)
- Technology service providers

## 6. SECURITY MEASURES
We implement physical, technical and administrative measures to protect your personal data.

## 7. EXERCISE OF ARCO RIGHTS
To exercise your rights of Access, Rectification, Cancellation or Opposition, send request to: arco@pickleballmexico.org

Last update: August 20, 2023`,
        version: '2.0',
        is_active: false,
        created_at: new Date('2023-08-20 14:30:00')
      },
      
      // Current policy (more detailed and comprehensive)
      {
        content: `# PRIVACY POLICY
## Mexican Pickleball Federation
### Version 3.0 - January 2024

## 1. IDENTITY AND ADDRESS OF THE DATA CONTROLLER
**Name:** Mexican Pickleball Federation, A.C.
**Address:** Av. Insurgentes Sur 1234, Col. Del Valle, C.P. 03100, Mexico City
**Website:** www.pickleballmexico.org
**Contact email:** contact@pickleballmexico.org

## 2. PERSONAL DATA WE COLLECT AND SOURCES

### 2.1 Directly from the data subject:
- **Identification data:** Full name, CURP, RFC, date and place of birth, nationality, marital status
- **Contact data:** Complete address, phone numbers, email, social media
- **Employment data:** Occupation, workplace, approximate income
- **Sports data:** NTRP level, competitive history, relevant injuries, club affiliation
- **Academic data:** Education level, sports certifications
- **Financial data:** For payment processing and fees
- **Biometric data:** Photographs, fingerprint for access control where applicable

### 2.2 From third parties:
- International ranking information
- References from other sports organizations
- Public competition data

### 2.3 Automatically:
- Web browsing data
- Geolocation during events
- Digital platform interactions

## 3. PURPOSES OF PROCESSING

### 3.1 Primary purposes (necessary for the legal relationship):
- Registration and affiliation control
- Organization of official tournaments and competitions
- Issuance of licenses, certifications and credentials
- Administration of official rankings and statistics
- Compliance with tax and regulatory obligations
- Official communications about events and regulations
- Access control to facilities and events
- Handling complaints, suggestions and procedures

### 3.2 Secondary purposes (require consent):
- Sports and promotional marketing
- Commercial communication from sponsors
- Invitations to special events
- Market analysis and statistical studies
- Development of new products and services
- Media promotion
- Multimedia content creation
- Benefits and discount program

## 4. DATA TRANSFERS

### 4.1 National transfers:
- **CONADE and sports authorities:** For regulatory compliance
- **Affiliated state committees:** For regional event organization
- **Affiliated clubs:** For membership management
- **Service providers:** Technology, logistics, financial
- **Auditors and consultants:** For tax and legal compliance

### 4.2 International transfers:
- **International Federation of Pickleball (IFP):** For world rankings
- **USA Pickleball Association:** For binational events
- **Technology platforms:** AWS, Google Cloud (with contractual clauses)

## 5. DATA SUBJECT RIGHTS

You have the right to:
- **Access** your personal data and know its processing
- **Rectify** inaccurate or incomplete data
- **Cancel** processing when inappropriate
- **Oppose** processing for specific purposes
- **Revoke** your consent at any time
- **Limit** the use or disclosure of your data
- **Portability** of your data in structured formats

## 6. MEANS TO EXERCISE ARCO RIGHTS

### 6.1 Request:
**Email:** arco@pickleballmexico.org
**Address:** Av. Insurgentes Sur 1234, Col. Del Valle, Mexico City
**Phone:** +52 55 1234-5678
**Service hours:** Monday to Friday from 9:00 AM to 5:00 PM

### 6.2 Requirements:
- Name and address of the data subject
- Documents proving identity
- Clear description of data and rights to exercise
- Elements to locate personal data

### 6.3 Response times:
- **Response:** Maximum 20 business days
- **Implementation:** Maximum 15 additional business days

## 7. USE OF COOKIES AND TRACKING TECHNOLOGIES

Our website uses:
- **Technical cookies:** For basic operation
- **Analytics cookies:** For usage statistics (Google Analytics)
- **Advertising cookies:** For content personalization
- **Tracking pixels:** For campaign effectiveness

You can configure your browser to reject cookies.

## 8. SECURITY MEASURES

We implement measures:
- **Physical:** Access control, security cameras
- **Technical:** SSL encryption, firewalls, automatic backups
- **Administrative:** Access policies, staff training

## 9. DATA RETENTION

Data will be retained for:
- **Active affiliate data:** While maintaining membership
- **Inactive affiliate data:** 5 years after deregistration
- **Financial data:** 10 years for tax obligations
- **Minor data:** Until reaching legal age + 5 years
- **Marketing data:** Until consent revocation

## 10. PROCESSING OF MINORS' DATA

For minors under 18 years old, required:
- Consent from father, mother or legal guardian
- Documentation proving parental authority
- Minimum data necessary for sports activity

## 11. CHANGES TO PRIVACY NOTICE

Any modification will be communicated through:
- Publication on official website
- Email to registered affiliates
- Notices at physical facilities

## 12. COMPLAINTS TO AUTHORITY

In case of disagreement, you may contact the National Institute of Transparency, Access to Information and Protection of Personal Data (INAI):
- **Website:** www.inai.org.mx
- **Phone:** 800-835-4324

## 13. DATA PROTECTION OFFICER CONTACT

**Officer:** Patricia Herrera, Data Protection Officer
**Email:** dpo@pickleballmexico.org
**Phone:** +52 55 1234-5679 ext. 102

---

**Last update date:** January 15, 2024
**Effective date:** February 1, 2024

The Mexican Pickleball Federation is committed to protecting the privacy of your personal data in accordance with applicable Mexican legislation.`,
        version: '3.0',
        is_active: true,
        created_at: new Date('2024-01-15 16:00:00')
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('privacy_policy', null, {});
  }
};