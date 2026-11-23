import { useState } from "react";
import {
  Address,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import { beacon } from "./lib/beacon";
import { useBeacon } from "./hooks/useBeacon";

// Testnet contract. Change if you redeploy.
const CONTRACT_ID = "CCKKQRHPWJYRUWWY3M34CNIFK4AUZK2PG3IFI4UY2GIZRZLEN4E3LLQO";
const RPC_URL = "https://soroban-testnet.stellar.org";

const server = new rpc.Server(RPC_URL);

export default function App() {
  const { address, login, logout } = useBeacon();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  const show = (msg: string, error = false) => {
    setStatus(msg);
    setIsError(error);
  };

  async function mint() {
    const trimmed = name.trim();
    if (!address) return show("Log in first.", true);
    if (!trimmed) return show("Type a name first.", true);

    setBusy(true);
    try {
      const passphrase = beacon.getNetwork().passphrase;

      show("Preparing transaction…");
      const source = await server.getAccount(address);
      const tx = new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: passphrase })
        .addOperation(
          new Contract(CONTRACT_ID).call(
            "mint",
            new Address(address).toScVal(),
            nativeToScVal(trimmed, { type: "string" }),
          ),
        )
        .setTimeout(60)
        .build();

      const prepared = await server.prepareTransaction(tx);

      show("Approve in the Beacon wallet…");
      const { signedTxXdr } = await beacon.signTransaction(prepared.toXDR());

      const sent = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, passphrase),
      );
      if (sent.status === "ERROR") throw new Error("Transaction rejected.");

      show("Waiting for confirmation…");
      let result = await server.getTransaction(sent.hash);
      for (let i = 0; i < 30 && result.status === "NOT_FOUND"; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await server.getTransaction(sent.hash);
      }
      if (result.status !== "SUCCESS") throw new Error(`Transaction ${result.status}.`);

      const id = scValToNative(result.returnValue!);
      show(`Minted certificate #${id} for "${trimmed}". Tx: ${sent.hash}`);
      setName("");
    } catch (e) {
      show(e instanceof Error ? e.message : String(e), true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Cert Mint</h1>

      {address ? (
        <>
          <p>Connected: {address}</p>
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <button onClick={() => login().catch((e) => show(String(e.message ?? e), true))}>
          Log in with Google
        </button>
      )}

      <input
        placeholder="Type your name"
        value={name}
        disabled={!address || busy}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={mint} disabled={!address || busy}>
        Mint certificate
      </button>

      <p className={isError ? "status err" : "status"}>{status}</p>
    </>
  );
}
