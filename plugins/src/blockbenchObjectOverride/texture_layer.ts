export { };

declare global {
    interface TextureLayer {
        alpha_lock: boolean;
        toggleAlphaLock(): TextureLayer;
    }
}