import { JsonRpcProvider, Wallet, Contract } from 'ethers'
import contractArtifact from './artifacts/FileRegistry.json' assert { type: 'json' }

const GANACHE_URL = 'http://127.0.0.1:8545'
const PRIVATE_KEY = '0x2fc3158d8025d46cd4726bd67b705b446360c40cab05ef6749252ffdccbffd7d'

const provider = new JsonRpcProvider(GANACHE_URL)
const wallet = new Wallet(PRIVATE_KEY, provider)
const contractAddress = '0xb2a4deda4e49ed47f5a4942e5ef1c7dede6f2c72'

export const fileRegistry = new Contract(
  contractAddress,
  contractArtifact.abi,
  wallet
)

export async function storeOnChain(fileId, version, fileHash) {
  const tx = await fileRegistry.storeFile(fileId, version, fileHash)
  await tx.wait()
  console.log(`File stored on-chain! Tx Hash: ${tx.hash}`)
}

export async function getFileOnChain(fileId) {
  const data = await fileRegistry.getFile(fileId)
  return {
    version: data[0],
    timestamp: Number(data[1]),
    fileHash: data[2],
    owner: data[3]
  }
}
