import { BeaconAuth } from "@beaconmcu/auth";

export const beacon = new BeaconAuth({
    clientId: import.meta.env.VITE_BEACON_CLIENT_ID,
    defaultNetwork: "testnet",
});