/**
 * API integration for external services
 */
export function useTypingAPI() {
  const submitEntry = async (text) => {
    try {
      const response = await fetch('/.netlify/functions/submit-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('Failed to submit entry:', response.status);
      }
    } catch (error) {
      console.warn('Error submitting entry:', error);
    }
  };

  return {
    submitEntry,
  };
}