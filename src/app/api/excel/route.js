import { Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";

async function getToken() {
  const response = await axios.post(
    process.env.MS_AUTH_URL,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRECT,
      scope: "https://graph.microsoft.com/.default",
    })
  );
  return response.data.access_token;
}

export async function POST(req, res) {
  try {
    const token = await getToken();

    console.log(token);

    // const client = Client.init({
    //   authProvider: (done) => {
    //     done(null, token);
    //   },
    // });

    // const { responses } = req.body;

    // const fileId = process.env.FILE_ID;
    // const userId = process.env.USER_ID;
    // const worksheetName = process.env.WORKSHEET;

    // const existingColumns = await client
    //   .api(`/users/${userId}/drive/items/${fileId}/workbook/worksheets/${worksheetName}/tables`)
    //   .get();

    // const columnNames = existingColumns.columns.map((column) => column.name);

    // const requiredColumns = Object.keys(responses);

    // const missingColumns = requiredColumns.filter((column) => !columnNames.includes(column));

    // if (missingColumns.length > 0) {
    //   await Promise.all(
    //     missingColumns.map(async (column) => {
    //       await client
    //         .api(`/users/${userId}/drive/items/${fileId}/workbook/worksheets/${worksheetName}/tables`)
    //         .post({
    //           address: `${worksheetName}!${column}1`,
    //           values: [[column]],
    //         });
    //     })
    //   );
    // }

    // await client
    //   .api(`/users/${userId}/drive/items/${fileId}/workbook/worksheets/${worksheetName}/table/rows/add`)
    //   .post({
    //     values: [Object.values(responses)],
    //   });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Error updating Excel file:", error);
    res.status(500).json({ message: "Error updating Excel file" });
  }
}
