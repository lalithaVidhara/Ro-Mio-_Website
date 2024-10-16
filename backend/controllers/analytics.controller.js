export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        res.json(analyticsData);
    } catch (error) {
        
    }
};

export const getAnalyticsData = async () => {
    
}