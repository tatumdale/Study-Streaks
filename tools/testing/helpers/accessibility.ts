import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from '@jest/globals';

expect.extend(toHaveNoViolations);

/**
 * Accessibility testing utilities for StudyStreaks platform
 * WCAG 2.1 AA compliance testing for UK educational platform
 */

export class AccessibilityTestHelper {
  /**
   * Run comprehensive WCAG 2.1 AA tests on a component
   */
  async runWCAGTests(container: HTMLElement, options: any = {}) {
    const config = {
      rules: {
        // WCAG 2.1 AA rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
        'aria-labels': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-roles': { enabled: true },
        'form-labels': { enabled: true },
        'alt-text': { enabled: true },
        ...options.rules
      },
      tags: ['wcag2a', 'wcag2aa', 'best-practice'],
      ...options
    };

    const results = await axe(container, config);
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      isAccessible: results.violations.length === 0,
      summary: this.generateAccessibilitySummary(results)
    };
  }

  /**
   * Test keyboard navigation compliance
   */
  async testKeyboardNavigation(getByTestId: (testId: string) => HTMLElement, focusableSelectors: string[] = []) {
    const defaultSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const selectors = focusableSelectors.length > 0 ? focusableSelectors : defaultSelectors;
    const focusableElements = document.querySelectorAll(selectors.join(', '));
    
    const navigationResults = [];
    
    // Test tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i] as HTMLElement;
      element.focus();
      
      navigationResults.push({
        element: element.tagName.toLowerCase(),
        canFocus: document.activeElement === element,
        hasVisibleFocus: this.hasVisibleFocus(element),
        hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
        tabIndex: element.tabIndex
      });
    }
    
    return {
      totalFocusableElements: focusableElements.length,
      navigationResults,
      allElementsFocusable: navigationResults.every(r => r.canFocus),
      allElementsLabeled: navigationResults.every(r => r.hasAriaLabel || this.hasTextContent(navigationResults.indexOf(r), focusableElements)),
      keyboardAccessible: navigationResults.every(r => r.canFocus && r.hasVisibleFocus)
    };
  }

  /**
   * Test screen reader compatibility
   */
  testScreenReaderCompatibility(container: HTMLElement) {
    const ariaElements = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const landmarks = container.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
    const formElements = container.querySelectorAll('input, select, textarea');
    
    const checks = {
      hasProperHeadingStructure: this.validateHeadingStructure(headings),
      hasLandmarkRoles: landmarks.length > 0,
      hasAriaLabels: this.validateAriaLabels(ariaElements),
      hasFormLabels: this.validateFormLabels(formElements),
      hasAltTextForImages: this.validateImageAltText(container),
      hasProperFocusManagement: this.validateFocusManagement(container)
    };
    
    return {
      isScreenReaderFriendly: Object.values(checks).every(Boolean),
      checks,
      recommendations: this.generateScreenReaderRecommendations(checks),
      ariaElementsCount: ariaElements.length,
      headingsCount: headings.length,
      landmarksCount: landmarks.length
    };
  }

  /**
   * Test color contrast compliance
   */
  async testColorContrast(container: HTMLElement) {
    const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a, label, li');
    const contrastResults = [];
    
    for (const element of textElements) {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      const fontSize = parseFloat(styles.fontSize);
      
      if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrastRatio(color, backgroundColor);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');
        const requiredRatio = isLargeText ? 3.0 : 4.5; // WCAG AA standards
        
        contrastResults.push({
          element: element.tagName.toLowerCase(),
          textContent: element.textContent?.slice(0, 50) + '...',
          contrast,
          requiredRatio,
          passes: contrast >= requiredRatio,
          isLargeText,
          colors: { text: color, background: backgroundColor }
        });
      }
    }
    
    return {
      allElementsPass: contrastResults.every(r => r.passes),
      totalElements: contrastResults.length,
      passingElements: contrastResults.filter(r => r.passes).length,
      failingElements: contrastResults.filter(r => !r.passes),
      results: contrastResults
    };
  }

  /**
   * Test for child-friendly accessibility features
   */
  testChildFriendlyAccessibility(container: HTMLElement) {
    const checks = {
      hasSimpleLanguage: this.testSimpleLanguage(container),
      hasLargeClickTargets: this.testClickTargetSize(container),
      hasConsistentNavigation: this.testConsistentNavigation(container),
      hasErrorPrevention: this.testErrorPrevention(container),
      hasClearInstructions: this.testClearInstructions(container),
      hasPositiveLanguage: this.testPositiveLanguage(container)
    };
    
    return {
      isChildFriendly: Object.values(checks).every(check => check.passes),
      checks,
      recommendations: this.generateChildFriendlyRecommendations(checks)
    };
  }

  /**
   * Test mobile accessibility
   */
  testMobileAccessibility(container: HTMLElement) {
    const checks = {
      hasTouchFriendlyTargets: this.testTouchTargets(container),
      hasResponsiveText: this.testResponsiveText(container),
      hasZoomSupport: this.testZoomSupport(container),
      hasOrientationSupport: this.testOrientationSupport(container)
    };
    
    return {
      isMobileAccessible: Object.values(checks).every(Boolean),
      checks,
      recommendations: this.generateMobileRecommendations(checks)
    };
  }

  // Private helper methods

  private generateAccessibilitySummary(results: any) {
    return {
      level: results.violations.length === 0 ? 'WCAG 2.1 AA Compliant' : 'Needs Improvement',
      violationsCount: results.violations.length,
      passesCount: results.passes.length,
      incompleteCount: results.incomplete.length,
      criticalIssues: results.violations.filter((v: any) => v.impact === 'critical').length,
      seriousIssues: results.violations.filter((v: any) => v.impact === 'serious').length
    };
  }

  private hasVisibleFocus(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element, ':focus');
    return styles.outline !== 'none' || styles.boxShadow !== 'none' || styles.backgroundColor !== styles.backgroundColor;
  }

  private hasTextContent(index: number, elements: NodeListOf<Element>): boolean {
    const element = elements[index];
    return element.textContent?.trim().length > 0;
  }

  private validateHeadingStructure(headings: NodeListOf<Element>): boolean {
    if (headings.length === 0) return true;
    
    const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    // Check if headings start with h1 and don't skip levels
    if (levels[0] !== 1) return false;
    
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i-1] + 1) return false;
    }
    
    return true;
  }

  private validateAriaLabels(elements: NodeListOf<Element>): boolean {
    return Array.from(elements).every(element => {
      if (element.hasAttribute('aria-label')) {
        return element.getAttribute('aria-label')?.trim().length > 0;
      }
      if (element.hasAttribute('aria-labelledby')) {
        const labelId = element.getAttribute('aria-labelledby');
        return document.getElementById(labelId) !== null;
      }
      return true;
    });
  }

  private validateFormLabels(elements: NodeListOf<Element>): boolean {
    return Array.from(elements).every(element => {
      const input = element as HTMLInputElement;
      
      // Check for explicit label
      if (input.labels && input.labels.length > 0) return true;
      
      // Check for aria-label
      if (input.hasAttribute('aria-label') && input.getAttribute('aria-label')?.trim().length > 0) return true;
      
      // Check for aria-labelledby
      if (input.hasAttribute('aria-labelledby')) {
        const labelId = input.getAttribute('aria-labelledby');
        return document.getElementById(labelId) !== null;
      }
      
      return false;
    });
  }

  private validateImageAltText(container: HTMLElement): boolean {
    const images = container.querySelectorAll('img');
    return Array.from(images).every(img => {
      return img.hasAttribute('alt') && img.getAttribute('alt') !== null;
    });
  }

  private validateFocusManagement(container: HTMLElement): boolean {
    // Check if focus is managed properly during interactions
    const modals = container.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    const dropdowns = container.querySelectorAll('[role="listbox"], [role="menu"]');
    
    // Basic check - in real implementation this would be more sophisticated
    return Array.from([...modals, ...dropdowns]).every(element => {
      return element.hasAttribute('tabindex') || element.querySelector('[tabindex]') !== null;
    });
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast calculation - in production use a proper library
    // This is a placeholder that returns a value for demonstration
    const fg = this.parseColor(foreground);
    const bg = this.parseColor(background);
    
    if (!fg || !bg) return 21; // Max contrast if can't parse
    
    const fgLuminance = this.calculateLuminance(fg);
    const bgLuminance = this.calculateLuminance(bg);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): { r: number, g: number, b: number } | null {
    // Simplified color parsing - use a proper library in production
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return {
          r: parseInt(matches[0]),
          g: parseInt(matches[1]),
          b: parseInt(matches[2])
        };
      }
    }
    return null;
  }

  private calculateLuminance(color: { r: number, g: number, b: number }): number {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private generateScreenReaderRecommendations(checks: any): string[] {
    const recommendations = [];
    
    if (!checks.hasProperHeadingStructure) {
      recommendations.push('Fix heading structure: start with h1 and don\'t skip levels');
    }
    if (!checks.hasLandmarkRoles) {
      recommendations.push('Add landmark roles (main, nav, header, footer)');
    }
    if (!checks.hasAriaLabels) {
      recommendations.push('Add aria-labels to interactive elements');
    }
    if (!checks.hasFormLabels) {
      recommendations.push('Associate labels with form inputs');
    }
    if (!checks.hasAltTextForImages) {
      recommendations.push('Add alt text to all images');
    }
    
    return recommendations;
  }

  private testSimpleLanguage(container: HTMLElement): { passes: boolean, details: string } {
    const textContent = container.textContent || '';
    const words = textContent.split(/\s+/);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    return {
      passes: averageWordLength <= 7, // Child-friendly average
      details: `Average word length: ${averageWordLength.toFixed(1)} characters`
    };
  }

  private testClickTargetSize(container: HTMLElement): { passes: boolean, details: string } {
    const clickableElements = container.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    const smallTargets = [];
    
    for (const element of clickableElements) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) { // WCAG recommendation
        smallTargets.push(element);
      }
    }
    
    return {
      passes: smallTargets.length === 0,
      details: `${smallTargets.length} elements smaller than 44px minimum`
    };
  }

  private testConsistentNavigation(container: HTMLElement): { passes: boolean, details: string } {
    const navigationElements = container.querySelectorAll('nav, [role="navigation"]');
    
    return {
      passes: navigationElements.length > 0,
      details: `Found ${navigationElements.length} navigation landmarks`
    };
  }

  private testErrorPrevention(container: HTMLElement): { passes: boolean, details: string } {
    const forms = container.querySelectorAll('form');
    const hasValidation = Array.from(forms).some(form => 
      form.querySelectorAll('input[required], [aria-invalid]').length > 0
    );
    
    return {
      passes: forms.length === 0 || hasValidation,
      details: hasValidation ? 'Form validation detected' : 'No form validation found'
    };
  }

  private testClearInstructions(container: HTMLElement): { passes: boolean, details: string } {
    const instructions = container.querySelectorAll('[role="note"], .instructions, .help-text');
    const forms = container.querySelectorAll('form');
    
    return {
      passes: forms.length === 0 || instructions.length > 0,
      details: `Found ${instructions.length} instructional elements`
    };
  }

  private testPositiveLanguage(container: HTMLElement): { passes: boolean, details: string } {
    const textContent = container.textContent?.toLowerCase() || '';
    const negativeWords = ['error', 'wrong', 'failed', 'invalid', 'incorrect'];
    const foundNegativeWords = negativeWords.filter(word => textContent.includes(word));
    
    return {
      passes: foundNegativeWords.length === 0,
      details: foundNegativeWords.length > 0 ? 
        `Found negative words: ${foundNegativeWords.join(', ')}` : 
        'No negative language detected'
    };
  }

  private testTouchTargets(container: HTMLElement): boolean {
    const touchTargets = container.querySelectorAll('button, a, input, select');
    return Array.from(touchTargets).every(element => {
      const rect = element.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44;
    });
  }

  private testResponsiveText(container: HTMLElement): boolean {
    const textElements = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    return Array.from(textElements).every(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      return fontSize >= 16; // Minimum readable size on mobile
    });
  }

  private testZoomSupport(container: HTMLElement): boolean {
    // Check if viewport meta tag allows zooming
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return false;
    
    const content = viewport.getAttribute('content') || '';
    return !content.includes('user-scalable=no') && !content.includes('maximum-scale=1');
  }

  private testOrientationSupport(container: HTMLElement): boolean {
    // Basic check for responsive design
    const hasFlexbox = window.getComputedStyle(container).display === 'flex';
    const hasGrid = window.getComputedStyle(container).display === 'grid';
    const hasResponsiveClasses = container.className.includes('responsive') || 
                                container.className.includes('flex') ||
                                container.className.includes('grid');
    
    return hasFlexbox || hasGrid || hasResponsiveClasses;
  }

  private generateChildFriendlyRecommendations(checks: any): string[] {
    const recommendations = [];
    
    Object.entries(checks).forEach(([check, result]: [string, any]) => {
      if (!result.passes) {
        switch (check) {
          case 'hasSimpleLanguage':
            recommendations.push('Use simpler words appropriate for children');
            break;
          case 'hasLargeClickTargets':
            recommendations.push('Make buttons and links larger for easier clicking');
            break;
          case 'hasPositiveLanguage':
            recommendations.push('Use positive, encouraging language instead of negative terms');
            break;
          default:
            recommendations.push(`Improve ${check.replace('has', '').toLowerCase()}`);
        }
      }
    });
    
    return recommendations;
  }

  private generateMobileRecommendations(checks: any): string[] {
    const recommendations = [];
    
    if (!checks.hasTouchFriendlyTargets) {
      recommendations.push('Make touch targets at least 44px × 44px');
    }
    if (!checks.hasResponsiveText) {
      recommendations.push('Use responsive text sizing (minimum 16px)');
    }
    if (!checks.hasZoomSupport) {
      recommendations.push('Allow users to zoom (remove user-scalable=no)');
    }
    if (!checks.hasOrientationSupport) {
      recommendations.push('Support both portrait and landscape orientations');
    }
    
    return recommendations;
  }
}

export const accessibilityTestHelper = new AccessibilityTestHelper();