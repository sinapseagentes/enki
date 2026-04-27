export type AutomationTriggerType = 'card_moved' | 'card_created' | 'card_archived';
export type AutomationActionType = 'move' | 'add_label' | 'set_due_date';

export interface AutomationConfig {
  targetListId?: string;
  destinationListId?: string;
  label?: string;
  daysToDue?: number;
}

export interface Automation {
  id?: string;
  boardId: string;
  trigger: AutomationTriggerType;
  config: AutomationConfig;
  action: AutomationActionType;
  active: boolean;
  createdAt?: number;
}
