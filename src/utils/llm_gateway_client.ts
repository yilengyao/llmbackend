import { 
    model, 
    chatRequest,
    chatCompletion,
    generateImageRequest,
    imageResponse
} from "@innobridge/llmclient";

const getModels = async (baseUrl: string, apiKey: string): Promise<model.Models> => {
    try {
        const response = await fetch(`${baseUrl}/v1/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(`HTTP error! status: ${errJson.error.message}`);            
        }
        return await response.json() as model.Models;
    } catch (error) {
        console.error('Error fetching models:', error);
        throw error;
    }
};


// non-streaming
const getCompletion = async (
    baseUrl: string, 
    apiKey: string, 
    request: chatRequest.ChatRequest
): Promise<chatCompletion.ChatCompletion> => {
    try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...request, stream: false })
        });
        
        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(`HTTP error! status: ${errJson.error.message}`);
        }
        
        return await response.json() as chatCompletion.ChatCompletion;
    } catch (error) {
        console.error('Error creating completion:', error);
        throw error;
    }
};

// streaming
export async function* streamCompletion(
    baseUrl: string,
    apiKey: string,
    request: chatRequest.ChatRequest
  ): AsyncGenerator<string, void, unknown> {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...request, stream: true }),
    });
    if (!res.body) throw new Error("No streamable response");
  
    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
};

const generateImage = async (
    baseUrl: string, 
    apiKey: string, 
    request: generateImageRequest.GenerateImageRequest): Promise<imageResponse.ImageResponse> => {
    try {
        const response = await fetch(`${baseUrl}/v1/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            const errJson = await response.json();
            throw new Error(`HTTP error! status: ${errJson.error.message}`);
        }
        
        const data = await response.json();
        return data as imageResponse.ImageResponse;
    } catch (error: any) {
        console.error('Error generating image:', error.message);
        throw error;
    }
};

export {
    getModels,
    getCompletion,
    generateImage
};