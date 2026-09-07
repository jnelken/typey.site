<template>
  <Container
    height="screen"
    center
    max-width="default"
    padding="lg"
    @click="handleGlobalClick">
    <div class="typing-app">
      <!-- Title and controls share one slim row so the word the child is
           copying gets the room instead. -->
      <header class="topbar">
        <Text
          tag="h1"
          size="lg"
          color="primary"
          weight="bold"
          font="mono"
          :caps="typingApp.isCapsLockEnabled.value">
          🎯 Typey Site
        </Text>
        <Toolbar />
      </header>

      <WordPrompt />

      <TypingArea />

      <InputSection ref="inputSection" />

      <div class="help-text">
        <Text size="sm" align="center" color="light">
          Type anything and press Enter to move to the next line
        </Text>
      </div>
    </div>

    <Balloons :balloons="typingApp.balloons.value" />
    <Emojis :effects="typingApp.emojiEffects.value" />
    <MathAnimation />
    <WordGuide />

    <pre v-if="showSpeechDebug" class="speech-debug">{{ typingApp.speechDebug.value }}</pre>
  </Container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Container from './ui/Container.vue';
import Text from './ui/Text.vue';
import Toolbar from './features/typing/components/Toolbar.vue';
import WordPrompt from './features/typing/components/WordPrompt.vue';
import TypingArea from './features/typing/components/TypingArea.vue';
import InputSection from './features/typing/components/InputSection.vue';
import Balloons from './features/effects/components/Balloons.vue';
import Emojis from './features/effects/components/Emojis.vue';
import MathAnimation from './features/math/components/MathAnimation.vue';
import WordGuide from './features/typing/components/WordGuide.vue';
import { createTypingApp, provideTypingApp } from './composables/useTypingApp';

const inputSection = ref(null);
const showSpeechDebug = new URLSearchParams(window.location.search).has('debug');

// Create and provide the typing app context
const typingApp = createTypingApp();
provideTypingApp(typingApp);

const focusInput = () => {
  if (inputSection.value) {
    inputSection.value.focus();
  }
};

const handleGlobalClick = event => {
  // Don't refocus if clicking on the input itself
  if (event.target.closest('.input-section')) {
    return;
  }

  // Small delay to allow click actions to complete
  setTimeout(() => {
    focusInput();
  }, 500);
};

onMounted(() => {
  typingApp.initApp();

  nextTick(() => {
    if (inputSection.value) {
      inputSection.value.focus();
    }
  });
});
</script>

<style scoped>
.typing-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .topbar h1 {
    font-size: var(--font-size-base);
  }
}

.help-text {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  z-index: 50;
}

.speech-debug {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  margin: 0;
  padding: 6px 10px;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.85);
  color: #0f0;
}
</style>
