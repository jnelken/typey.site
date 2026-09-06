<template>
  <Container
    height="screen"
    center
    max-width="default"
    padding="lg"
    @click="handleGlobalClick">
    <div class="typing-app">
      <div class="header">
        <Text tag="h1" size="3xl" align="center" color="primary" weight="bold">
          🎯 Typey Site
        </Text>
        <Text tag="p" size="lg" align="center" color="secondary">
          Fun typing for kids!
        </Text>
      </div>

      <Toolbar />

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
    <EasterEggGuide />

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
import EasterEggGuide from './features/easter-eggs/components/EasterEggGuide.vue';
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

.header {
  padding: var(--spacing-lg) 0 var(--spacing-md);
  flex-shrink: 0;
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
