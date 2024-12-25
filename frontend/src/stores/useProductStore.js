import {create} from "zustand";
import toast from "react-hot-toast";
import axios from "../libs/axios";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,


    setProducts: (products) => set({products}),
    
    createProduct: async (productData) => {
        set({loading: true});
        try {
            const res = await axios.post("/products", productData);
            set((state) => ({
                products: [...state.products, res.data],
                loading: false
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred in creating product");
            set({loading: false});
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true });
		try {
			const response = await axios.get("/products");
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
    },

    deleteProduct: async (id) => {},

    toggleFeaturedProduct: async (id) => {},



}));