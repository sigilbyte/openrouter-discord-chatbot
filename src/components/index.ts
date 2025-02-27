/**
 * Component registration system
 */

import { Client } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { Component } from '../types/component.types';

// Import components
import { dropdownComponent } from './dropdown.component';
import { buttonComponent } from './button.component';

/**
 * Component manager for registering and handling components
 */
export class ComponentManager {
  private components: Map<string, Component>;
  private static instance: ComponentManager;

  /**
   * Creates a new component manager
   */
  private constructor() {
    this.components = new Map<string, Component>();
    this.registerComponents();
  }

  /**
   * Gets the component manager instance (singleton)
   * @returns The component manager instance
   */
  public static getInstance(): ComponentManager {
    if (!ComponentManager.instance) {
      ComponentManager.instance = new ComponentManager();
    }
    return ComponentManager.instance;
  }

  /**
   * Registers all components
   */
  private registerComponents(): void {
    // Register components
    this.registerComponent(dropdownComponent);
    this.registerComponent(buttonComponent);
  }

  /**
   * Registers a component
   * @param component The component to register
   */
  private registerComponent(component: Component): void {
    this.components.set(component.options.customId, component);
    console.log(`Registered component: ${component.options.customId}`);
  }

  /**
   * Handles an interaction
   * @param client The Discord client
   * @param interaction The interaction to handle
   * @returns True if the interaction was handled, false otherwise
   */
  public async handleInteraction(client: Client, interaction: Interaction): Promise<boolean> {
    try {
      // Check if interaction is a select menu or button interaction
      if (!interaction.isStringSelectMenu() && !interaction.isButton()) {
        return false;
      }
      
      // Get the component ID
      const customId = interaction.customId;
      
      // Find the component handler
      const component = this.components.get(customId) || 
        Array.from(this.components.values()).find(comp => customId.startsWith(comp.options.customId));
      
      // If no component handler is found, return false
      if (!component) {
        return false;
      }
      
      // Execute the component handler
      await component.execute(client, interaction);
      return true;
    } catch (error) {
      console.error('Component Interaction Error:', error);
      return false;
    }
  }
}
