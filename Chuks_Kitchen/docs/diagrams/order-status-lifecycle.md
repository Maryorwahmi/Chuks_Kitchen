# Order Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending

    Pending --> Confirmed: Admin confirms
    Pending --> Cancelled: Customer/Admin cancels

    Confirmed --> Preparing: Admin starts preparation
    Confirmed --> Cancelled: Customer/Admin cancels

    Preparing --> Out_for_Delivery: Admin dispatches
    Preparing --> Cancelled: Admin cancels

    Out_for_Delivery --> Completed: Delivery completed

    Cancelled --> [*]
    Completed --> [*]
```
