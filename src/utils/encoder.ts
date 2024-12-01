async function generateHash(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data); // Hash the text
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join(""); // Convert bytes to hex string
  return hashHex; // Return the hash as a string
}

export { generateHash };
