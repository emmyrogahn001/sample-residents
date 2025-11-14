

export default async function handler(request, response) {

  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return response.status(500).json({ error: "API key is not configured." });
  }

  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + API_KEY;

  
  const prompt = `
      Generate a JSON array of 200 random people for a 
      Barangay Management System in the Philippines.

      Only output the raw JSON array, starting with [ and ending with ].
      Do not include any other text like "Here is the JSON:" or markdown tags.
      
      Each object in the array must use these exact fields:
      - firstName: A common Filipino first name.
      - middleName: A common Filipino last name used as a middle name.
      - lastName: A common Filipino last name.
      - suffix: (e.g., "Jr.", "Sr.", "III"). Make this blank about 80% of the time.
      - birthdate: A random date in "YYYY-MM-DD" format.
      - gender: "Male" or "Female".
      - civilStatus: "Single", "Married", "Widowed", or "Separated".
      - purok: One of "Purok 1", "Purok 2", "Purok 3", "Purok 4", or "Purok 5".
      - barangay: This field MUST always be the exact string "Barangay Matindeg".
      - streetAddress: A realistic-sounding fake Filipino street address (e.g., "123 Mabini St.", "Lot 4, Block 5, Sampaguita St."). Do NOT include any purok or barangay name in this field.
      - occupation: A common occupation.
      - contactNumber: A fake 11-digit PH mobile number (e.g., "09#########").
      - email: A fake email address, ending in @example.com.
      - bloodType: A random blood type (e.g., "A+", "O-", "B+").
      - birthPlace: A city and province in the Philippines (e.g., "Manila, NCR").
  `;

  try {
    
    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`API Error: ${errorData.error.message}`);
    }

    const data = await geminiResponse.json();
    let jsonText = data.candidates[0].content.parts[0].text;

   
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "");
    jsonText = jsonText.trim();
    
  
    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.lastIndexOf(']');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
      const parsedJson = JSON.parse(jsonText);
      
      return response.status(200).json(parsedJson);
    } else {
      throw new Error("API did not return a valid JSON array.");
    }

  } catch (error) {
    console.error("Backend Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
