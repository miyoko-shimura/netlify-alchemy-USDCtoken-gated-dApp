import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

import styles from "../styles/Home.module.css";

export default function Home() {
  const { address } = useAccount();
  const [hasVerified, setHasVerified] = useState(false);

  const [message] = useState(
    "Creating dApps with Create Web3 Dapp is easy af!"
  );
  const { data, error, isLoading, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      setSecretMessage("Verifying payment... ⏳");
      setTimeout(() => {
        checkIfUserHasPaid(address, variables.message, data);
      }, 3000);
      setHasVerified(true);
    },
  });

  const [secretMessage, setSecretMessage] = useState(
    "You have to pay $1 USDC to see the secret! 👀"
  );

  useEffect(() => {
    setTimeout(() => {
      setHasVerified(false);
      setSecretMessage("You have to pay $1 USDC to see the secret! 👀");
    }, 500);
  }, [address]);

  async function checkIfUserHasPaid(userAddress, message, data) {
    const verificationData = {
      signerAddress: userAddress,
      signerMessage: message,
      signerData: data,
    };
    const response = await fetch("/api/authUser", {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
    const messageResponse = await response.json();
    setSecretMessage(messageResponse.message);
  }
  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.message}>{secretMessage}</h1>
        <div>
          {!hasVerified ? (
            <button
              className={styles.button}
              onClick={() => signMessage({ message })}
            >
              <b>Verify Payment With Signature</b>
            </button>
          ) : (
            ""
          )}
          {error && <div>{error.message}</div>}
        </div>
      </main>
    </div>
  );
}
