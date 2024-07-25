import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parseHuawei } from "../parsers/huaweiParser";
import { parseOntInfoZTESNsState } from "../parsers/zteStateParser";
import { parseOntInfoZTESNs } from "../parsers/zteSnParser";
import { combineZTEData } from "../utils/combineZTEData";

const prisma = new PrismaClient();

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface UploadedFiles {
  [fieldname: string]: UploadedFile[];
}

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as UploadedFiles;

    const singleCommandOutput = files["singleCommandOutput"]
      ? files["singleCommandOutput"][0]
      : null;
    const outputOfTwoCommandsIdOne = files["outputOfTwoCommandsIdOne"]
      ? files["outputOfTwoCommandsIdOne"][0]
      : null;
    const outputOfTwoCommandsIdTwo = files["outputOfTwoCommandsIdTwo"]
      ? files["outputOfTwoCommandsIdTwo"][0]
      : null;

    if (singleCommandOutput) {
      // aqui criaria outros if, para cada marca de OLT diferente
      if (singleCommandOutput.originalname === "OntInfo - Huawei.txt") {
        const huaweiData = singleCommandOutput.buffer.toString("utf-8");
        const huaweiParsed = parseHuawei(huaweiData);
        await prisma.oltOutput.createMany({ data: huaweiParsed });
      }
    }

    if (outputOfTwoCommandsIdOne && outputOfTwoCommandsIdTwo) {
      const ontInfoZTESNs = outputOfTwoCommandsIdOne.buffer.toString("utf-8");
      const zteState = outputOfTwoCommandsIdTwo.buffer.toString("utf-8");

      //traz a liberdade de escolher entre qualquer input de duas sáidas no front-end
      const [firstParsed, secondParsed] =
        outputOfTwoCommandsIdOne.originalname === "OntInfo - ZTE - SNs.txt"
          ? [
              parseOntInfoZTESNsState(zteState),
              parseOntInfoZTESNs(ontInfoZTESNs),
            ]
          : [
              parseOntInfoZTESNsState(ontInfoZTESNs),
              parseOntInfoZTESNs(zteState),
            ];

      const combinedData = combineZTEData(firstParsed, secondParsed);

      await prisma.oltOutput.createMany({ data: combinedData });
    }

    res.status(200).send("Files processed and data inserted successfully");
  } catch (error) {
    console.error("Error processing files", error);
    res.status(500).send("Error processing files");
  }
};
