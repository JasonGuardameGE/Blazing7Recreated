export interface UIItem {
    path: string;
    name: string;

    /**
     * Expected values:
     * scene, panel, alert, toast, loading
     */
    type: any;
}