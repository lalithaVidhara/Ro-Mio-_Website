export const protectRoute = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
    } catch (error) {
        
    }
}