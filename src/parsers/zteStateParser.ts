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
