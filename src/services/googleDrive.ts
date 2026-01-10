/**
 * Google Drive API Service - Updated for Google Identity Services (GIS)
 * Handles authentication, file upload, and folder management for Ayekta EMR
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

/**
 * Initialize the Google API client
 */
async function gapiInit(): Promise<void> {
  await (window as any).gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  });
}

/**
 * Initialize Google Identity Services
 */
function gisInit(): void {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // will be set at request time
  });
}

/**
 * Initialize Google Drive - loads both GAPI and GIS
 */
export async function initGoogleDrive(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load GAPI script
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;

    gapiScript.onload = () => {
      (window as any).gapi.load('client', async () => {
        try {
          await gapiInit();

          // Load GIS script
          const gisScript = document.createElement('script');
          gisScript.src = 'https://accounts.google.com/gsi/client';
          gisScript.async = true;
          gisScript.defer = true;

          gisScript.onload = () => {
            gisInit();

            // Restore token from sessionStorage if available
            const savedToken = sessionStorage.getItem('ayekta_drive_token');
            if (savedToken) {
              accessToken = savedToken;
              console.log('Restored access token from sessionStorage');
            }

            resolve();
          };

          gisScript.onerror = () => reject(new Error('Failed to load GIS'));
          document.body.appendChild(gisScript);
        } catch (error) {
          reject(error);
        }
      });
    };

    gapiScript.onerror = () => reject(new Error('Failed to load GAPI'));
    document.body.appendChild(gapiScript);
  });
}

/**
 * Sign in to Google - requests access token
 */
export async function signInToGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Identity Services not initialized'));
      return;
    }

    try {
      // Set the callback for token response
      tokenClient.callback = async (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          reject(response);
          return;
        }

        accessToken = response.access_token;
        // Persist token to sessionStorage
        sessionStorage.setItem('ayekta_drive_token', accessToken);
        console.log('Successfully obtained and stored access token');
        resolve();
      };

      // Request access token - this opens the OAuth popup
      if (accessToken === null) {
        // Prompt the user to select a Google Account and ask for consent
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Skip display of account chooser and consent dialog
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      reject(error);
    }
  });
}

/**
 * Sign out from Google - revoke access token
 */
export async function signOutFromGoogle(): Promise<void> {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Access token revoked');
    });
    accessToken = null;
    // Clear persisted token
    sessionStorage.removeItem('ayekta_drive_token');
  }
}

/**
 * Check if user is signed in
 */
export function isUserSignedIn(): boolean {
  return accessToken !== null;
}

/**
 * Get or create the Ayekta EMR folder in Google Drive
 */
export async function getOrCreateAyektaFolder(): Promise<string> {
  if (!accessToken) {
    throw new Error('Not signed in to Google');
  }

  const folderName = 'Ayekta EMR Data';

  try {
    // Search for existing folder
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create folder if it doesn't exist
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    const createData = await createResponse.json();
    return createData.id;
  } catch (error) {
    console.error('Error getting/creating Ayekta folder:', error);
    throw error;
  }
}

/**
 * Upload a file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  mimeType: string,
  folderId?: string,
  createdAt?: string,
  updatedAt?: string
): Promise<string> {
  if (!accessToken) {
    throw new Error('Not signed in to Google');
  }

  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: folderId ? [folderId] : undefined,
      createdTime: createdAt,
      modifiedTime: updatedAt,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' +
      mimeType +
      '\r\n\r\n' +
      content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      }
    );

    const data = await response.json();
    console.log('File uploaded to Drive:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
}

/**
 * Update an existing file in Google Drive
 * Uses multipart upload to update both content and metadata (including modifiedTime)
 */
export async function updateFileInDrive(
  fileId: string,
  content: string,
  mimeType: string,
  modifiedTime?: string
): Promise<void> {
  if (!accessToken) {
    throw new Error('Not signed in to Google');
  }

  try {
    // Use multipart upload to update both content and metadata
    const metadata = {
      modifiedTime: modifiedTime,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' +
      mimeType +
      '\r\n\r\n' +
      content +
      closeDelimiter;

    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });

    console.log('File updated in Drive:', fileId);
  } catch (error) {
    console.error('Error updating file in Drive:', error);
    throw error;
  }
}

/**
 * Search for a file by name in a specific folder
 */
export async function findFileInFolder(
  fileName: string,
  folderId: string
): Promise<string | null> {
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id,name)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error finding file in folder:', error);
    return null;
  }
}

/**
 * Upload patient data to Google Drive (JSON and PDF)
 */
export async function uploadPatientDataToDrive(
  ishiId: string,
  jsonContent: string,
  pdfBlob?: Blob,
  firstSavedAt?: string,
  updatedAt?: string
): Promise<{ jsonFileId: string; pdfFileId?: string }> {
  if (!accessToken) {
    throw new Error('Not signed in to Google Drive. Please sign in first.');
  }

  try {
    // Get or create Ayekta folder
    const folderId = await getOrCreateAyektaFolder();

    const jsonFileName = `GH26${ishiId}.json`;
    const pdfFileName = `GH26${ishiId}_Chart.pdf`;

    // Check if files already exist
    const existingJsonId = await findFileInFolder(jsonFileName, folderId);
    const existingPdfId = pdfBlob ? await findFileInFolder(pdfFileName, folderId) : null;

    // Upload or update JSON
    let jsonFileId: string;
    if (existingJsonId) {
      await updateFileInDrive(existingJsonId, jsonContent, 'application/json', updatedAt);
      jsonFileId = existingJsonId;
    } else {
      jsonFileId = await uploadFileToDrive(jsonFileName, jsonContent, 'application/json', folderId, firstSavedAt, updatedAt);
    }

    // Upload or update PDF if provided
    let pdfFileId: string | undefined;
    if (pdfBlob) {
      // Convert blob to ArrayBuffer for proper binary upload
      const pdfArrayBuffer = await blobToArrayBuffer(pdfBlob);
      const pdfBase64 = arrayBufferToBase64(pdfArrayBuffer);

      if (existingPdfId) {
        await updateFileInDriveBinary(existingPdfId, pdfBase64, 'application/pdf', updatedAt);
        pdfFileId = existingPdfId;
      } else {
        pdfFileId = await uploadFileToDriveBinary(pdfFileName, pdfBase64, 'application/pdf', folderId, firstSavedAt, updatedAt);
      }
    }

    return { jsonFileId, pdfFileId };
  } catch (error) {
    console.error('Error uploading patient data to Drive:', error);
    throw error;
  }
}

/**
 * Convert Blob to ArrayBuffer for binary uploads
 */
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Upload binary file (PDF) to Google Drive using multipart upload
 */
async function uploadFileToDriveBinary(
  fileName: string,
  base64Content: string,
  mimeType: string,
  folderId?: string,
  createdAt?: string,
  updatedAt?: string
): Promise<string> {
  if (!accessToken) {
    throw new Error('Not signed in to Google');
  }

  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: folderId ? [folderId] : undefined,
      createdTime: createdAt,
      modifiedTime: updatedAt,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' +
      mimeType +
      '\r\nContent-Transfer-Encoding: base64\r\n\r\n' +
      base64Content +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      }
    );

    const data = await response.json();
    console.log('Binary file uploaded to Drive:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error uploading binary file to Drive:', error);
    throw error;
  }
}

/**
 * Update binary file in Google Drive
 * Uses multipart upload to update both content and metadata
 */
async function updateFileInDriveBinary(
  fileId: string,
  base64Content: string,
  mimeType: string,
  modifiedTime?: string
): Promise<void> {
  if (!accessToken) {
    throw new Error('Not signed in to Google');
  }

  try {
    // Use multipart upload to update both content and metadata
    const metadata = {
      modifiedTime: modifiedTime,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' +
      mimeType +
      '\r\nContent-Transfer-Encoding: base64\r\n\r\n' +
      base64Content +
      closeDelimiter;

    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });

    console.log('Binary file updated in Drive:', fileId);
  } catch (error) {
    console.error('Error updating binary file in Drive:', error);
    throw error;
  }
}
