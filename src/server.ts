import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

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

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post(
    "/upload",
    upload.fields([
        { name: "huaweiFile", maxCount: 1 },
        { name: "zteSnFile", maxCount: 1 },
        { name: "zteStateFile", maxCount: 1 },
    ]),
    async (req: any, res: Response) => {
        try {
            const huaweiFile = req.files["huaweiFile"]
                ? req.files["huaweiFile"][0]
                : null;

            const zteSnFile = req.files["zteSnFile"]
                ? req.files["zteSnFile"][0]
                : null;

            const zteStateFile = req.files["zteStateFile"]
                ? req.files["zteStateFile"][0]
                : null;

            if (huaweiFile) {
                const huaweiData = huaweiFile.buffer.toString("utf-8");
                const huaweiParsed = parseHuawei(huaweiData);
                await prisma.oltOutput.createMany({ data: huaweiParsed });
            }

            if (zteSnFile && zteStateFile) {
                const ontInfoZTESNs = zteSnFile.buffer.toString("utf-8");

                const zteState = zteStateFile.buffer.toString("utf-8");

                if (zteSnFile.originalname === "OntInfo - ZTE - SNs.txt") {
                    const zteStateParsed = parseOntInfoZTESNsState(zteState);
                    const ontInfoZTESNsParsed =
                        parseOntInfoZTESNs(ontInfoZTESNs);

                    const combinedData = combineZTEData(
                        zteStateParsed,
                        ontInfoZTESNsParsed
                    );

                    await prisma.oltOutput.createMany({ data: combinedData });
                }
                //condição caso o usuário troque os inputs de formulário, irá funcionar esse trecho de código
                if (zteSnFile.originalname !== "OntInfo - ZTE - SNs.txt") {
                    const zteStateParsed =
                        parseOntInfoZTESNsState(ontInfoZTESNs);
                    const ontInfoZTESNsParsed = parseOntInfoZTESNs(zteState);

                    const combinedData = combineZTEData(
                        zteStateParsed,
                        ontInfoZTESNsParsed
                    );

                    await prisma.oltOutput.createMany({ data: combinedData });
                }
            }

            res.status(200).send(
                "Files processed and data inserted successfully"
            );
        } catch (error) {
            console.error("Error processing files", error);
            res.status(500).send("Error processing files");
        }
    }
);

app.post("/oltoutput", async (req, res) => {
    const { data } = req.body;

    try {
        const createdOutputs = [];
        for (const item of data) {
            const response = await prisma.oltOutput.create({
                data: {
                    slot: item.slot,
                    port: item.port,
                    ont_id: item.ont_id,
                    sn: item.sn,
                    state: item.state,
                    olt_type: item.olt_type,
                },
            });
            createdOutputs.push(response);
        }

        console.log("Dados salvos com sucesso no banco de dados.");

        res.status(200).json({
            message: "Dados salvos com sucesso no banco de dados.",
            data: createdOutputs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar o registro" });
    }
});

app.get("/data", async (req, res) => {
    try {
        const data = await prisma.oltOutput.findMany();
        res.json(data);
    } catch (err) {
        console.error("Erro ao obter os dados:", err);
        res.status(500).send("Erro ao obter os dados");
    }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
