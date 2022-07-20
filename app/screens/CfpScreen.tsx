import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { StackedBarChartData } from "react-native-chart-kit/dist/StackedBarChart";
import { DataTable, Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Loading from "../components/util/Loading";
import Colors from "../config/Colors";
import { DeFiButton } from "../elements/Buttons";
import { RadioButton } from "../elements/RadioButton";
import { SpacerV } from "../elements/Spacers";
import { CompactRow, CompactCell } from "../elements/Tables";
import { H1, H3, T5 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { CfpResult, ResultStatus, VotingType } from "../models/CfpResult";
import { CfpVote, CfpVotes } from "../models/User";
import { getCfpResults, getCfpVotes, getSettings, getStakingRoutes, putCfpVotes } from "../services/ApiService";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";
import { openUrl } from "../utils/Utils";

const DfxCfpNumbers: number[] = [];

const CfpScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cfpFilter, setCfpFilter] = useState<"all" | "dfx">("all");
  const [cfpResults, setCfpResults] = useState<(CfpResult)[]>();
  const [canVote, setCanVote] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [votes, setVotes] = useState<CfpVotes | undefined>();
  const [isSaving, setIsSaving] = useState<{ number: Number; vote: CfpVote } | undefined>();

  useAuthGuard(session);

  const specialVotingCfp: CfpResult = {
    number: 0,
    title: "Abstimmung: DFX Masternode CFP/DFIP Bewertungslogik",
    type: VotingType.CFP,
    dfiAmount: 0,
    htmlUrl: "",
    currentResult: ResultStatus.APPROVED,
    totalVotes: {
      total: 0,
      possible: 0,
      turnout: 0,
      yes: 0,
      neutral: 0,
      no: 0
    },
    cakeVotes: {
      total: 0,
      yes: 0,
      neutral: 0,
      no: 0
    },
    voteDetails: {
      yes: [],
      no: [],
      neutral: []
    },
    startDate: "2022-07-23T23:59:59.000Z",
    endDate: "2022-07-30T23:59:59.000Z"
  }

  const isSpecialVoting = (result: CfpResult) => result.title === specialVotingCfp.title

  useEffect(() => {
    Promise.all([getCfpResults("latest"), getCfpVotes(), getStakingRoutes(), getSettings()])
      .then(([results, votes, stakingRoutes, settings]) => {

        console.log('result: ', results.pop())

        const currentDate = new Date()
        const expiryDate = new Date(specialVotingCfp.endDate)

        // specialVotingCfp automatically disappears after expiryDate
        if (currentDate < expiryDate) {
          results.push(specialVotingCfp)
        }

        setCfpResults(results);
        setVotes(votes);
        setCanVote(stakingRoutes.find((r) => r.balance >= 100) != null);
        setIsVotingOpen(settings.cfpVotingOpen);
      })
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const getData = (result: CfpResult): StackedBarChartData => {
    return {
      labels: [],
      legend: [
        `${t("cfp.yes")} (${Math.round((result.totalVotes.yes / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.neutral")} (${Math.round((result.totalVotes.neutral / result.totalVotes.total) * 100)}%)`,
        `${t("cfp.no")} (${Math.round((result.totalVotes.no / result.totalVotes.total) * 100)}%)`,
      ],
      data: [[], [result.totalVotes.yes, result.totalVotes.neutral, result.totalVotes.no]],
      barColors: [Colors.Success, Colors.LightGrey, Colors.Error],
    };
  };

  const onVote = (number: number, vote: CfpVote) => {
    setVotes((votes) => {
      votes = { ...(votes ?? {}), [number]: vote };

      setIsSaving({ number, vote });
      putCfpVotes(votes).finally(() => setIsSaving(undefined));

      return votes;
    });
  };

  const config: AbstractChartConfig = {
    backgroundColor: Colors.Blue,
    backgroundGradientFrom: Colors.Blue,
    backgroundGradientTo: Colors.Blue,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,  255,  255,  ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,  255,  255,  ${opacity})`,
    propsForBackgroundLines: {
      stroke: Colors.Blue,
    },
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={t("cfp.title")} />
        <SpacerV height={30} />

        {isLoading ? (
          <Loading size="large" />
        ) : (
          <>
            {DfxCfpNumbers.length > 0 && (
              <>
                <View style={AppStyles.containerHorizontalWrap}>
                  <RadioButton
                    label={t("cfp.dfx_only")}
                    onPress={() => setCfpFilter("dfx")}
                    checked={cfpFilter === "dfx"}
                  />
                  <RadioButton label={t("cfp.all")} onPress={() => setCfpFilter("all")} checked={cfpFilter === "all"} />
                </View>
                <SpacerV height={50} />
              </>
            )}

            {cfpResults
              ?.filter((r) => cfpFilter === "all" || DfxCfpNumbers.includes(r.number))
              ?.sort((a, b) => a.number - b.number)
              .map((result) => (
                <View key={result.number} style={{ width: "100%" }}>
                  <H3 text={result.title} style={AppStyles.center} />
                  {(isSpecialVoting(result)) 
                    ? 
                      <View style={AppStyles.halfWidth} >
                        <T5 text={description1} /* style={AppStyles.center}  *//>
                      </View>
                    :
                      (
                       <>
                        <DeFiButton onPress={() => openUrl(result.htmlUrl)} compact>
                          {t("cfp.read_proposal")}
                        </DeFiButton>

                        <View style={styles.cfpContainer}>
                          <View>
                            <DataTable style={{ width: 300 }}>
                              <CompactRow>
                                <CompactCell>ID</CompactCell>
                                <CompactCell>#{result.number}</CompactCell>
                              </CompactRow>
                              <CompactRow>
                                <CompactCell>{t("cfp.voting")}</CompactCell>
                                <CompactCell>
                                  {result.totalVotes.yes} / {result.totalVotes.neutral} / {result.totalVotes.no}
                                </CompactCell>
                              </CompactRow>
                              <CompactRow>
                                <CompactCell>#{t("cfp.votes")}</CompactCell>
                                <CompactCell>{result.totalVotes.total}</CompactCell>
                              </CompactRow>
                              <CompactRow>
                                <CompactCell>{t("cfp.vote_turnout")}</CompactCell>
                                <CompactCell>{result.totalVotes.turnout}%</CompactCell>
                              </CompactRow>
                              <CompactRow>
                                <CompactCell>{t("cfp.current_result")}</CompactCell>
                                <CompactCell>{t(`cfp.${result.currentResult.toLowerCase()}`)}</CompactCell>
                              </CompactRow>
                            </DataTable>
                          </View>
                          {result.totalVotes.total > 0 && (
                            <View style={styles.chartContainer}>
                              <StackedBarChart
                                data={getData(result)}
                                width={350}
                                height={200}
                                chartConfig={config}
                                hideLegend={false}
                                withHorizontalLabels={false}
                                style={{ marginTop: 5 }}
                              />
                            </View>
                          )}
                        </View>
                       </>
                      )
                  }

                  {canVote || isSpecialVoting(result) && (
                    <>
                      <SpacerV />
                      <Text style={[AppStyles.center, AppStyles.b]}>{t("cfp.your_vote")}</Text>
                      <View style={[AppStyles.containerHorizontalWrap, styles.voteContainer]}>
                        <RadioButton
                          label={t("cfp.yes")}
                          onPress={() => onVote(result.number, CfpVote.YES)}
                          checked={votes?.[result.number] === CfpVote.YES}
                          disabled={!isVotingOpen && !isSpecialVoting(result)}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.YES}
                        />
                        <RadioButton
                          label={t("cfp.no")}
                          onPress={() => onVote(result.number, CfpVote.NO)}
                          checked={votes?.[result.number] === CfpVote.NO}
                          disabled={!isVotingOpen && !isSpecialVoting(result)}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NO}
                        />
                        <RadioButton
                          label={t("cfp.neutral")}
                          onPress={() => onVote(result.number, CfpVote.NEUTRAL)}
                          checked={(votes?.[result.number] ?? CfpVote.NEUTRAL) === CfpVote.NEUTRAL}
                          disabled={!isVotingOpen && !isSpecialVoting(result)}
                          loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NEUTRAL}
                        />
                      </View>
                    </>
                  )}

                  <View style={AppStyles.halfWidth} >
                    <T5 text={description2} /* style={AppStyles.center}  */ />
                  </View>

                  <SpacerV height={50} />
                </View>
              ))}
          </>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  cfpContainer: {
    flexDirection: "row",
    flexWrap: "wrap-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    width: 250,
    height: 180,
    alignItems: "flex-end",
    overflow: "hidden",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  voteContainer: {
    justifyContent: "center",
  },
});

export default withSession(CfpScreen);

const description = `
Jeder Nutzer des DFI Stakingservice von DFX erhält eine gewichtete Stimme auf Basis der investierten DFI. Zur Wahl stehen zwei alternative Abstimmungsmechanismen. 


Auswahlmöglichkeiten:

DFX soll mit allen Masternodes als Kollektiv mit ja/nein/neutral abstimmen
DFX soll mit allen Masternodes anteilig der abgegebenen Stimmen mit ja/nein/neutral abstimmen
Neutral


Kollektivbetrachtung:

Abhängig der Wahlergebnisse der jeweiligen CFPs/DFIPs von der DFX Community stimmt DFX mit allen Masternodes für seine Kunden ab. 
> 50% - DFX votet mit allen Masternodes „nein“
50% - DFX votet mit allen Masternodes „neutral“
>50% - DFX votet mit allen Masternodes „ja“
Die Kollektivbetrachtung wird nur angewendet, so lange DFX <10 % der DeFiChain Masternodes für seine Kunden betreibt. Wird dieser Schwellenwert überschritten wird DFX automatisch die anteilige Betrachtung wählen


Anteilige Betrachtung:

Abhängig der Wahlergebnisse der jeweiligen CFPs von der DFX Community stimmt DFX für seine Kunden anteilig der abgegeben Stimmen mit ja/nein/neutral ab


`

const description1 = `
Jeder Nutzer des DFI Stakingservice von DFX erhält eine gewichtete Stimme auf Basis der investierten DFI. Zur Wahl stehen zwei alternative Abstimmungsmechanismen. 


Auswahlmöglichkeiten:

DFX soll mit allen Masternodes als Kollektiv mit ja/nein/neutral abstimmen
DFX soll mit allen Masternodes anteilig der abgegebenen Stimmen mit ja/nein/neutral abstimmen
Neutral
`

const description2 = `
Kollektivbetrachtung:

Abhängig der Wahlergebnisse der jeweiligen CFPs/DFIPs von der DFX Community stimmt DFX mit allen Masternodes für seine Kunden ab. 
> 50% - DFX votet mit allen Masternodes „nein“
50% - DFX votet mit allen Masternodes „neutral“
>50% - DFX votet mit allen Masternodes „ja“
Die Kollektivbetrachtung wird nur angewendet, so lange DFX <10 % der DeFiChain Masternodes für seine Kunden betreibt. Wird dieser Schwellenwert überschritten wird DFX automatisch die anteilige Betrachtung wählen


Anteilige Betrachtung:

Abhängig der Wahlergebnisse der jeweiligen CFPs von der DFX Community stimmt DFX für seine Kunden anteilig der abgegeben Stimmen mit ja/nein/neutral ab


`