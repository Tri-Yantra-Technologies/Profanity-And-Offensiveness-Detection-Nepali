import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Configure axios with timeout
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 second timeout (BERT models may take longer)
});

export interface LabelConfidence {
    label: string;
    confidence: number;
}

export interface PredictionResponse {
    profanity: LabelConfidence;
    offensiveness: LabelConfidence;
    latency_ms: number;
    model_used?: string;
    gender?: LabelConfidence;  // Only for multi_output model
}

export interface GenderResponse {
    gender: LabelConfidence;
    latency_ms: number;
    model_used: string;
}

export interface AnalyzeResponse {
    text: string;
    processed_text: string;
    profanity_binary: LabelConfidence | null;
    offensive_binary: LabelConfidence | null;
    multilabel: LabelConfidence | null;
    gender: LabelConfidence | null;
    latency_ms: number;
    models_used: string[];
}

export interface ModelInfo {
    type: string;
    name: string;
    description: string;
}

export interface ModelsListResponse {
    available_models: ModelInfo[];
    default_model: string;
}

export interface MetaResponse {
    model_version: string;
    paper: string;
    paper_link: string;
    mock_mode: boolean;
    available_models: string[];
    rate_limit: {
        requests: number;
        window_seconds: number;
    };
}

export interface ApiError {
    error: string;
    message: string;
    request_id?: string;
}

/**
 * Get user-friendly error message from API error
 */
const getErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;

        // Timeout
        if (axiosError.code === 'ECONNABORTED') {
            return 'Request timed out. Please try again.';
        }

        // Network error
        if (axiosError.code === 'ERR_NETWORK') {
            return 'Cannot connect to server. Please ensure the backend is running.';
        }

        // Rate limit
        if (axiosError.response?.status === 429) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        // Service unavailable (e.g., model still loading)
        if (axiosError.response?.status === 503) {
            return axiosError.response.data?.message || 'Service temporarily unavailable. Please try again in a moment.';
        }

        // Server error with message
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        // Generic HTTP error
        if (axiosError.response?.status) {
            return `Server error (${axiosError.response.status}). Please try again.`;
        }
    }

    return 'An unexpected error occurred. Please try again.';
};

export const predictText = async (text: string, modelType?: string): Promise<PredictionResponse> => {
    try {
        const response = await api.post<PredictionResponse>('/predict', {
            text,
            model_type: modelType
        });
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const predictGender = async (text: string): Promise<GenderResponse> => {
    try {
        const response = await api.post<GenderResponse>('/predict/gender', { text });
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const analyzeText = async (text: string): Promise<AnalyzeResponse> => {
    try {
        const response = await api.post<AnalyzeResponse>('/analyze', { text });
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const submitFeedback = async (feedback: {
    text: string;
    model_used: string;
    prediction: any;
    is_correct: boolean;
    corrected_label?: string;
}): Promise<{ status: string }> => {
    try {
        const response = await api.post('/feedback', feedback);
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const checkHealth = async (): Promise<{ status: string }> => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const getMeta = async (): Promise<MetaResponse> => {
    try {
        const response = await api.get<MetaResponse>('/meta');
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const getModels = async (): Promise<ModelsListResponse> => {
    try {
        const response = await api.get<ModelsListResponse>('/models');
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

