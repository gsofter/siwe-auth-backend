import { Injectable, Logger } from '@nestjs/common';
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class SiweService {
  private readonly logger = new Logger(SiweService.name);
  getSiweNonce() {
    return generateNonce();
  }

  async verifyMessage(pMessage: string, signature: string, nonce: string) {
    const SIWEObject = new SiweMessage(pMessage);

    const { data: message } = await SIWEObject.verify({
      signature: signature,
      nonce: nonce,
    }).catch((e) => {
      this.logger.error(e);
      throw e;
    });

    return message;
  }
}
