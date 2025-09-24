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

      <Controls />

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
    <EasterEggGuide />
  </Container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Container from './ui/Container.vue';
import Text from './ui/Text.vue';
import Controls from './components/Controls.vue';
import TypingArea from './components/TypingArea.vue';
import InputSection from './components/InputSection.vue';
import Balloons from './components/Balloons.vue';
import Emojis from './components/Emojis.vue';
import EasterEggGuide from './components/EasterEggGuide.vue';
import { createTypingApp, provideTypingApp } from './composables/useTypingApp';

const inputSection = ref(null);

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
</style>
