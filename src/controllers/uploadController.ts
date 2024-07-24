import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parseHuawei } from "../parsers/huaweiParser";
import { parseOntInfoZTESNsState } from "../parsers/zteStateParser";
import { parseOntInfoZTESNs } from "../parsers/zteSnParser";
import { combineZTEData } from "../utils/combineZTEData";

const prisma = new PrismaClient();

export const uploadFiles = async (req: any, res: Response) => {
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
                const ontInfoZTESNsParsed = parseOntInfoZTESNs(ontInfoZTESNs);
                const combinedData = combineZTEData(
                    zteStateParsed,
                    ontInfoZTESNsParsed
                );
                await prisma.oltOutput.createMany({ data: combinedData });
            } else {
                const zteStateParsed = parseOntInfoZTESNsState(ontInfoZTESNs);
                const ontInfoZTESNsParsed = parseOntInfoZTESNs(zteState);
                const combinedData = combineZTEData(
                    zteStateParsed,
                    ontInfoZTESNsParsed
                );
                await prisma.oltOutput.createMany({ data: combinedData });
            }
        }

        res.status(200).send("Files processed and data inserted successfully");
    } catch (error) {
        console.error("Error processing files", error);
        res.status(500).send("Error processing files");
    }
};
