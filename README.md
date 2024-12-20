# Claude API Examples

This repository contains examples and guides for working with Anthropic's Claude API. Claude is a state-of-the-art AI assistant capable of understanding and generating human-like text for various tasks.

## Getting Started

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up your API key:
   ```bash
   export ANTHROPIC_API_KEY='your-api-key'
   ```

3. Run the example script:
   ```bash
   python examples/basic_chat.py
   ```

## Examples

- `examples/basic_chat.py`: Simple example of having a conversation with Claude
- `examples/streaming.py`: Example of using streaming responses
- `examples/function_calling.py`: Example of using Claude's function calling capabilities

## Best Practices

See [BEST_PRACTICES.md](BEST_PRACTICES.md) for guidelines on:
- Writing effective prompts
- Managing context length
- Handling responses
- Error handling

## Resources

- [Official Claude API Documentation](https://docs.anthropic.com/claude/)
- [Anthropic's AI Safety Guidelines](https://www.anthropic.com/safety)
- [Claude Web Interface](https://claude.ai)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.