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
