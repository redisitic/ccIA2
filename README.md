# Blockchain-Based Decentralized Storage Design for Data Confidence Over Cloud-Native Edge Infrastructure

  

This project demonstrates a multi-step approach to securely store encrypted files, link their metadata on a private blockchain, and manage additional properties (e.g., attention/confidence labels) via a MongoDB-based service. It also includes a simple React front-end for uploading and retrieving files under specific rules. The project is based on [Blockchain-Based Decentralized Storage Design for Data Confidence Over Cloud-Native Edge Infrastructure](#%20Blockchain-Based%20Decentralized%20Storage%20Design%20for%20Data%20Confidence%20Over%20Cloud-Native%20Edge%20Infrastructure) by [Hannie Zang](https://ieeexplore.ieee.org/author/37086156347); [Ho Kim](https://ieeexplore.ieee.org/author/37089620075); [Jongwon Kim](https://ieeexplore.ieee.org/author/37281211300) et al.

  

## Overview



1.  **Private Blockchain (Ganache + Smart Contract)**

- A local Ethereum-compatible blockchain using Ganache.

- A `FileRegistry` smart contract storing minimal metadata on-chain (version, timestamp, hash reference, owner).

  

2.  **Storage Backend (Node.js)**

- A Node/Express service that encrypts files and stores them either locally or on IPFS.

- Exposes `/store` and `/retrieve` endpoints.

  

3. **Metadata Database (MongoDB)**

- Stores extended metadata (file location, access rights, attention/confidence labels).

- A Node.js/Mongoose service providing CRUD on metadata.

4.  **Front-End Demo (Vite + React + shadcn/ui)**

- A basic React app to upload files with labels and retrieve them under the attention/confidence rule.

---


## Step-by-Step Setup

  

### 1. Private Blockchain (Ganache)

  

1.  **Install Ganache**:

```bash

npm install -g ganache

```

or download Ganache Desktop.

2.  **Start Ganache** on `http://127.0.0.1:8545`.

3.  **Deploy** the `FileRegistry` contract using Truffle or Hardhat:

```bash

truffle compile

truffle migrate --reset

```

  

### 2. Storage Backend (Node.js)

  

1.  **Install** dependencies in `storage-service/`:

```bash

cd storage-service

npm install

```

2.  **blockchain.js** references:

-  **Ganache URL**: `http://127.0.0.1:8545`.

-  **Private Key**: from an account in Ganache with enough ETH.

-  **Contract Address**: from the deployed `FileRegistry`.

3.  **Run** the server:

```bash

node app.js

```

or

```bash

npm start

```

The service listens on `http://localhost:3000`.

  

### 3. Metadata Database (MongoDB)

  

1.  **Install MongoDB** or use Mongo Atlas.

2. In `metadata-service/`:

```bash

npm install

node app.js

```

or

```bash

npm start

```

3.  **Environment**:

- Default connection is `mongodb://127.0.0.1:27017/metadata_db`.

- Exposes endpoints like `GET /metadata/:fileId`, `POST /metadata`.

  


### 4. Front-End Demo (Vite + React)

  

1.  **Install** dependencies in `frontend/`:

```bash

npm install

npm run dev

```

2. The app will run at `http://localhost:5173` (default Vite).

3. The front-end has:

- A simple upload form pointing to `http://localhost:3000/store`.

- A retrieval form pointing to `http://localhost:3000/retrieve/:fileId`.

  

---

  

## Workflow

  

1.  **User** selects a file in the front-end, provides `label`, `attention`, `confidence`.

2. The **Front-End** sends a `POST /store` to **Storage Service**.

3.  **Storage Service**:

- Encrypts the file, stores it locally (or IPFS).

- Calls the **Metadata Service** to save extended properties (label, dataLocation, etc.).

- Calls the **Blockchain** (`FileRegistry`) to store minimal references on-chain (fileId, version, hash).

4. To **Retrieve**:

- The front-end calls `GET /retrieve/:fileId`.

- The storage service checks metadata, ensures `attention >= confidence`, and if allowed, **decrypts** and returns the file.

  

---

  

## Testing

  

1.  **Upload** with Postman or the React front-end:

```bash

curl -X POST -F "file=@test.pdf"  \

-F "attention=Always"  \

-F "confidence=Usually"  \

http://localhost:3000/store

```

2.  **Retrieve**:

```bash

curl http://localhost:3000/retrieve/test.pdf --output test.pdf

```

or from the front-end retrieval form.


 
