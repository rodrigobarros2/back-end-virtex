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
