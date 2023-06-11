

export enum StepUpFlow {
    CARD_PCI_DATA = 'pci-data',
    CARD_PIN = 'card-pin',
    CARD_ISSUANCE = 'card-issuance',
    CARD_LOCK = 'card-lock',
    CARD_UNLOCK = 'card-unlock',
    CARD_LIMIT = 'card-limit',
    S3D_AUTH = 's3d-authz',
    NAD_REGISTER = 'nad-register',
    NAD_TRANSFER = 'nad-transfer',
    NAD_DEACTIVATION = 'nad-deactivation',
    NAD_ACTIVATION = 'nad-activation',
    NAD_DEREGISTRATION = 'nad-deregistration',
    QR_PAYMENT = 'payment-authorization',
    NAD_MAINTENACE = 'nad-maintenance'
}

export type NotificationData = {
    flowId?: string;
    referenceId?: string;
    type: string;
    screen?: string;
    contextData?: object;
}