# 🔐 Hybrid Secure Cloud Storage using AES & AWS Integration

This project provides a secure cloud-based file storage system using **AES Symmetric Encryption** combined with **AWS Cloud Storage**. 
It allows users to upload files, encrypt them locally, store them securely on AWS, and later download and decrypt them.

---

## 🚀 Features
- AES Symmetric Encryption for file security  
- Upload, encrypt, store & download files securely  
- AWS S3 cloud integration for scalable storage  
- Simple & user-friendly interface  
- Lightweight Python backend  
- Ensures confidentiality and secure access to data  

---

## 🏗 Technologies Used
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Python (Flask/FastAPI/Django — update based on your project)  
- **Cloud:** AWS S3  
- **Encryption:** AES Cryptography  

---

## ⚙ Installation & Setup

1. Clone the repository
    ```bash
    git clone https://github.com/<your-username>/Hybrid-Secure-Cloud-Storage-using-AES--hybrid-Symmetric-Encryption-and-AWS-Integration.git
    cd Hybrid-Secure-Cloud-Storage-using-AES--hybrid-Symmetric-Encryption-and-AWS-Integration
    ```

2. Install dependencies
    ```bash
    pip install -r requirements.txt
    ```

3. Configure AWS Credentials
    ```bash
    aws configure
    ```
    Enter the following when prompted:
    - **AWS Access Key ID**
    - **AWS Secret Access Key**
    - **Default AWS Region** (ex: `ap-south-1`)

4. Run the application
    ```bash
    python app.py
    ```

5. Open in browser
    ```
    http://127.0.0.1:5000/
    ```

---

## 🔐 Workflow
1. User uploads a file
2. The system encrypts it using AES symmetric encryption
3. The encrypted file is stored securely in AWS S3
4. When requested, the file is downloaded and decrypted locally

---

## 🛡 Future Improvements
- Add user authentication & role-based access
- Build file integrity checks using hashing
- Support expiry-based / one-time download links
- Integrate secure key rotation + cloud KMS key storage

---
<!--📊 Example Use Case
This project can be used for:
- Secure file storage and retrieval systems
- Cloud-based encrypted document management
- Data protection solutions for organizations
- Projects requiring hybrid encryption + cloud deployment
- Academic or research-based demonstration of secure storage models

--- -->

📌 Notes
- This project is for educational and development purposes.
- Keep your AWS keys private — do not push them to GitHub.
- Encryption keys must be managed securely for real production use.
- For production-grade deployment, consider using AWS KMS, IAM roles, HTTPS, and authentication layers.

---

<!--📁 License
This project is open-source and distributed under the **MIT License**.  
You are free to modify and use it with attribution.

--- -->

🤝 Contribution
Contributions, issues, and feature requests are welcome!  
Feel free to **open an issue or create a pull request** to improve this project.

---

📬 Contact
For questions or collaboration, reach out:

**Name:** Ragamaie Nagineni  
**Email:** ragamaie.n@gmail.com  
**GitHub:** [Ragamaie-Nagineni](https://github.com/Ragamaie-Nagineni)  

