interface OntInfo {
    slot: string;
    port: string;
    ont_id: string;
    state: string;
    sn: string;
    olt_type: string;
}

export function parseHuawei(input: string) {
    let lines = input.split("\n");
    let data = [];
    let inDataSection = false;

    for (let line of lines) {
        if (line.includes("F/S/P   ONT")) {
            inDataSection = true;
            continue;
        }

        if (line.includes("-") && inDataSection) {
            continue;
        }

        if (line.includes("In port")) {
            break;
        }

        if (inDataSection && line.trim() !== "") {
            let parts = line.trim().split(/\s+/);
            if (parts.length >= 7) {
                let slot = parts[1].split("/").shift() ?? "";
                let port = parts[1].substring(2);
                let ont_id = parts[2];
                let sn = parts[3];
                let state = parts[5];
                let olt_type = "Huawei";

                data.push({ slot, port, ont_id, sn, state, olt_type });
            }
        }
    }

    return data;
}

export function parseOntInfoZTESNs(input: string) {
    const lines = input.split("\n");
    const data = [];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") {
            continue;
        }

        const columns = line.split(/\s+/);
        const onuIndex = columns[0];
        const authInfo = columns[3];

        const match = onuIndex.match(/gpon-onu_(\d+)\/(\d+)\/(\d+):(\d+)/);
        if (match) {
            const slot = match[1];
            const port = match[2];
            const ont_id = match[4];

            const snMatch = authInfo.match(/(\S+)/);
            const sn = snMatch ? snMatch[1] : "";

            const onuData = {
                slot: slot,
                port: port,
                ont_id: ont_id,
                state: "",
                sn: sn,
                olt_type: "ZTE",
            };

            data.push(onuData);
        }
    }

    return data;
}

export function parseOntInfoZTESNsState(input: string) {
    const lines = input.split("\n");
    const data = [];

    for (let i = 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "" || line.startsWith("ONU Number")) {
            continue;
        }

        const columns = line.split(/\s+/);

        const slotPortOnt = columns[0].split(" ");

        const slot = slotPortOnt[0].split("/")[0];
        const port = slotPortOnt[0].split("/")[1];
        const ont_id = slotPortOnt[0].split(":")[1];
        const state = columns[3];

        const onuData = {
            slot: slot,
            port: port,
            ont_id: ont_id,
            state: state,
            sn: "",
            olt_type: "ZTE",
        };

        data.push(onuData);
    }

    return data;
}

export const combineZTEData = (stateData: OntInfo[], snData: OntInfo[]) => {
    const combinedData = stateData.map((stateItem) => {
        const snItem = snData.find(
            (snItem) =>
                snItem.slot === stateItem.slot &&
                snItem.port === stateItem.port &&
                snItem.ont_id === stateItem.ont_id &&
                snItem.olt_type === stateItem.olt_type
        );
        return {
            ...stateItem,
            state: stateItem.state,
            sn: snItem ? snItem.sn : stateItem.sn,
        };
    });

    return combinedData;
};
