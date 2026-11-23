import { useEffect, useState } from "react";
import { BeaconError } from "@beaconmcu/auth";
import { beacon } from "../lib/beacon";

const quiet = (run: Promise<unknown>) =>
    run.catch((e) => {
        if (!(e instanceof BeaconError && e.code === -4)) throw e;
    });

export function useBeacon() {
    const [address, setAddress] = useState(beacon.getAddress());

    useEffect(() => beacon.on("accountChanged", setAddress), []);

    return {
        address,
        login: () => quiet(beacon.login()),
        logout: () => beacon.logout(),
        backupKey: () => quiet(beacon.exportWallet()),
    };
}