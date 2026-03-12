import { GoogleGenAI, Type } from "@google/genai";
import { User, WorkoutPlan, Course, Submission, Session, JournalEntry, WorkoutLog, CoachInsight } from "../types";

const getAiInstance = () => {
    const apiKey = process.env.API_KEY || window.HEYCHURCH_APP_CONFIG?.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing. Please check your configuration.");
    return new GoogleGenAI({ apiKey });
};

export const generateWorkoutPlan = async (anamnese: {
    goal: string;
    experience: string;
    oneRepMax: { squat: number, deadlift: number, bench: number };
    age: number;
    height: number;
    weight: number;
    frequency: number;
    duration: number; 
    equipment: string[];
    injuries: string;
}): Promise<WorkoutPlan> => {
    const ai = getAiInstance();
    
    const workoutPlanSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        duration: { type: Type.INTEGER },
        weeks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              week: { type: Type.INTEGER },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.INTEGER },
                          reps: { type: Type.STRING },
                          weight: { type: Type.STRING },
                          rest: { type: Type.STRING },
                        },
                        required: ['name', 'sets', 'reps', 'weight', 'rest'],
                      },
                    },
                  },
                  required: ['day', 'title', 'exercises'],
                },
              },
            },
            required: ['week', 'days'],
          },
        },
      },
      required: ['title', 'duration', 'weeks'],
    };

    const prompt = `
        You are a world-class performance coach. Generate a personalized ${anamnese.duration}-week periodized workout plan based on this user profile:
        - Goal: ${anamnese.goal}
        - Experience Level: ${anamnese.experience}
        - Frequency: ${anamnese.frequency} days per week
        - Biometrics: Age ${anamnese.age}, Height ${anamnese.height}cm, Weight ${anamnese.weight}kg
        - Equipment Available: ${anamnese.equipment.join(', ') || 'Bodyweight only'}
        - Strength Stats (1RM): Squat ${anamnese.oneRepMax.squat}kg, Bench ${anamnese.oneRepMax.bench}kg, Deadlift ${anamnese.oneRepMax.deadlift}kg
        - Medical Notes/Injuries: ${anamnese.injuries || 'None'}

        Periodization strategy:
        - Design the program such that each major muscle group is targeted approximately twice per week for optimal hypertrophy and strength growth.
        - Week 1: Foundation and form calibration.
        - Progression: Increase intensity gradually each week.
        - Deload: If duration is 8+ weeks, include a deload week every 4 weeks.

        FORMAT: Return strictly valid JSON matching the schema provided. No conversational text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        return JSON.parse(text) as WorkoutPlan;

    } catch (error) {
        console.error("Gemini Workout Generation Error:", error);
        throw error;
    }
};

export const generateGrowthJourney = async (goal: string, courses: Course[], user: User): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `Based on the user's goal: "${goal}", and available courses: ${JSON.stringify(courses.map(c => ({ id: c.id, title: c.title, description: c.description })))}, suggest a personalized growth journey for the user: ${JSON.stringify({ name: user.name, points: user.points, sessionProgress: user.sessionProgress })}. Provide a concise, encouraging text response suggesting which courses to take and why.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "Keep pursuing your spiritual growth!";
    } catch (error) {
        console.error("Gemini Growth Journey Error:", error);
        throw error;
    }
};

export const generateMonthlyReflection = async (user: User, history: JournalEntry[]): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `You are a spiritual mentor for ${user.name}. Based on these journal entries from the past month: ${JSON.stringify(history.map(e => ({ date: e.date, mood: e.mood, content: e.content })))}, write a personalized, encouraging monthly reflection letter. Acknowledge their mood patterns and specific experiences mentioned. Keep it warm and insightful.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text || "Your reflection letter is being prepared by your mentor.";
    } catch (error) {
        console.error("Gemini Monthly Reflection Error:", error);
        throw error;
    }
};

export const generateCoachInsight = async (user: User, recentLogs: WorkoutLog[]): Promise<CoachInsight> => {
    const ai = getAiInstance();
    const lang = user.language === 'German' ? 'German' : 'English';
    
    const prompt = `
        You are Coach Victor, a world-class AI Performance Analyst at HEY CHURCH.
        Analyze the workout logs for ${user.name} and provide a detailed analysis.
        
        User Goal: ${user.workoutPlan?.title || 'General Fitness'}
        User Biometrics: Age ${user.age}, Weight ${user.weight}kg, Height ${user.height}cm
        User Issues/Pains: ${user.onboardingAnswers?.injuries || 'None reported'}
        
        Recent Feedback Logs: ${JSON.stringify(recentLogs)}
        
        Requirements:
        1. Analyze if the user's feedback (difficulty and comments) matches their goal and addresses any mentioned issues or pains.
        2. Provide a deep analysis of what went well, what should be observed/kept, and what should be changed.
        3. Provide the entire response in ${lang}.
        4. Structure the response as JSON with:
           - "message": A motivational 2-sentence summary in ${lang}.
           - "insightType": "celebration", "correction", or "motivation".
           - "analysis": {
               "whatWentWell": "Analysis of successes in ${lang}",
               "whatToObserve": "What to keep or observe closely in ${lang}",
               "whatToChange": "Specific suggestions for change in ${lang}"
             }
        
        Tone: Professional, motivational, and insightful.
    `;

    try {
        const response = await ai.models.generateContent({ 
            model: 'gemini-3-flash-preview', 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const result = JSON.parse(response.text || '{}');
        return {
            message: result.message || (lang === 'German' ? "Konsistenz ist der Weg zum Fortschritt!" : "Consistency is the path to progress!"),
            insightType: result.insightType || 'motivation',
            analysis: result.analysis,
            generatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error("Gemini Coach Insight Error:", error);
        return {
            message: lang === 'German' ? "Mach weiter so!" : "Keep pushing towards your goals!",
            insightType: 'motivation',
            generatedAt: new Date().toISOString()
        };
    }
};

export const adjustWorkoutPlan = async (user: User, recentLogs: WorkoutLog[]): Promise<WorkoutPlan> => {
    const ai = getAiInstance();
    const lang = user.language === 'German' ? 'German' : 'English';
    
    const workoutPlanSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          duration: { type: Type.INTEGER },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      exercises: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            sets: { type: Type.INTEGER },
                            reps: { type: Type.STRING },
                            weight: { type: Type.STRING },
                            rest: { type: Type.STRING },
                          },
                          required: ['name', 'sets', 'reps', 'weight', 'rest'],
                        },
                      },
                    },
                    required: ['day', 'title', 'exercises'],
                  },
                },
              },
              required: ['week', 'days'],
            },
          },
        },
        required: ['title', 'duration', 'weeks'],
      };

    const prompt = `
        You are Coach Victor. Based on the user's current workout plan and their recent feedback, adjust the plan for the REMAINING weeks.
        
        Current Plan: ${JSON.stringify(user.workoutPlan)}
        Recent Feedback: ${JSON.stringify(recentLogs)}
        User Goal: ${user.workoutPlan?.title}
        User Issues/Pains: ${user.onboardingAnswers?.injuries || 'None reported'}
        
        Instructions:
        1. If the user says exercises are "Too Easy", increase weight, reps, or intensity.
        2. If "Too Hard", decrease weight or reps, or suggest safer alternatives.
        3. If the user mentions pain or issues, adjust exercises to be safer or suggest alternatives that don't aggravate the issue.
        4. Maintain the overall structure but optimize the exercises for the user's specific feedback.
        5. Return the FULL updated workout plan (all weeks, including the adjusted future ones).
        6. Language: All text fields in the JSON (title, exercise names, etc.) MUST be in ${lang}.
        
        FORMAT: Return strictly valid JSON matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        return JSON.parse(text) as WorkoutPlan;
    } catch (error) {
        console.error("Gemini Workout Adjustment Error:", error);
        throw error;
    }
};

export const generateAssessmentFeedback = async (user: User, scores: { [key: string]: number }): Promise<string> => {
    const ai = getAiInstance();
    const lang = user.language === 'German' ? 'German' : 'English';
    const prompt = `
        You are Pastor Victor at HEY CHURCH. Write a personal, prophetic, and deeply inspiring Visionary Analysis for ${user.name} based on their Faith Check scores (0-10 avg):
        ${JSON.stringify(scores)}

        Language: Please provide your analysis in ${lang}.

        Categories & Context: 
        1. Daily Walk with God (Roots, Grace). Score: ${scores.daily_walk}
        2. Deep Relationships (Community, Honesty). Score: ${scores.relationships}
        3. Make God Known (Mission, VIPs). Score: ${scores.mission}
        4. Serve Others (Sacrifice, Gifts). Score: ${scores.serve}
        5. Generosity (Kingdom-First Lifestyle). Score: ${scores.generosity}

        Requirements for your Visionary Analysis:
        - Address them directly: "My dear ${user.name},"
        - 1. INSPIRATIONAL INSIGHT: A warm opening interpreting their overall spiritual map as a unique landscape.
        - 2. DIVINE STRENGTH: Identify their highest score. Explain how this specific gift is vital for our city and church.
        - 3. THE THRESHOLD: Identify the lowest score. Explain that this is where the next level of their spiritual authority lies. Provide deep encouragement for their struggle in this area.
        - 4. PRACTICAL NEXT STEPS: Provide 2 specific, motivating action points for this week.
        - 5. THE 6-MONTH DREAM: Describe the vision of where they could be in 6 months if they lean into this area of growth.
        
        TONE: Inspiring, direct, and full of Grace and truth. Be prophetic and authoritative yet warm.
        LENGTH: Strictly between 150 and 200 words.
        FORMAT: Use standard sentence case (NO ALL CAPS). Use bold Markdown for key truths.
        SIGNATURE: End with: "Your city is waiting for you, Pastor Victor."
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        return text;
    } catch (error: any) {
        console.error("Gemini Assessment Feedback Error:", error);
        throw new Error("Pastor Victor's assistant is busy right now. Please stand in faith and try again.");
    }
};