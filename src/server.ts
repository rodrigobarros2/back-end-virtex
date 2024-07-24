import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import {
    combineZTEData,
    parseHuawei,
    parseOntInfoZTESNs,
    parseOntInfoZTESNsState,
} from "./utils/dataProcessors";

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
