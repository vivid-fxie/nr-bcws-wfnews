import { AfterViewInit, Component } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { FireCentres, currentFireYear } from '@app/utils';

@Component({
  selector: 'active-fires-widget',
  templateUrl: './active-fires-widget.component.html',
  styleUrls: ['./active-fires-widget.component.scss'],
})
export class ActiveFiresWidget implements AfterViewInit {
  public startupComplete = false;
  public selectedFireCentreCode = '';
  public fireCentreOptions = FireCentres;
  public activeFires: number;
  public activeFireOfNote: number;
  public activeOutOfControl: number;
  public activeBeingHeld: number;
  public activeUnderControl: number;
  public activeOutOfControlPct: number;
  public activeBeingHeldPct: number;
  public activeUnderControlPct: number;
  public outOfControlData = [];
  public beingHeldData = [];
  public underControlData = [];

  public outOfControlScheme = { domain: ['#FF0000', '#C2C2C2'] };
  public beingHeldScheme = { domain: ['#DADA19', '#C2C2C2'] };
  public underControlScheme = { domain: ['#98E600', '#C2C2C2'] };

  public chartSize = 180;

  constructor(private publishedIncidentService: PublishedIncidentService) {}

  ngAfterViewInit(): void {
    this.queryData();
  }

  queryData() {
    this.startupComplete = false;
    const fireCentre =
      this.selectedFireCentreCode && this.selectedFireCentreCode !== ''
        ? FireCentres.find((fc) => fc.code === this.selectedFireCentreCode)
            .description
        : 'BC';

    Promise.all([
      this.publishedIncidentService
        .fetchStatistics(currentFireYear() - 1, fireCentre)
        .toPromise(),
      this.publishedIncidentService
        .fetchStatistics(currentFireYear(), fireCentre)
        .toPromise(),
    ])
      .then(([previousYearStats, stats]) => {
        const currentYearActive =
          stats.reduce(
            (
              n,
              {
                activeBeingHeldFires,
                activeOutOfControlFires,
                activeUnderControlFires,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeOutOfControlFires +
              activeUnderControlFires,
            0,
          ) || 0;
        const previousYearActive =
          previousYearStats.reduce(
            (
              n,
              {
                activeBeingHeldFires,
                activeOutOfControlFires,
                activeUnderControlFires,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeOutOfControlFires +
              activeUnderControlFires,
            0,
          ) || 0;
        const currentYearActiveFoN =
          stats.reduce(
            (
              n,
              {
                activeBeingHeldFiresOfNote,
                activeOutOfControlFiresOfNote,
                activeUnderControlFiresOfNote,
              },
            ) =>
              n +
              activeBeingHeldFiresOfNote +
              activeOutOfControlFiresOfNote +
              activeUnderControlFiresOfNote,
            0,
          ) || 0;
        const previousYearActiveFoN =
          previousYearStats.reduce(
            (
              n,
              {
                activeBeingHeldFiresOfNote,
                activeOutOfControlFiresOfNote,
                activeUnderControlFiresOfNote,
              },
            ) =>
              n +
              activeBeingHeldFiresOfNote +
              activeOutOfControlFiresOfNote +
              activeUnderControlFiresOfNote,
            0,
          ) || 0;

        this.activeFires = currentYearActive + previousYearActive;
        this.activeFireOfNote = currentYearActiveFoN + previousYearActiveFoN;
        this.activeOutOfControl =
          (stats.reduce(
            (n, { activeOutOfControlFires }) => n + activeOutOfControlFires,
            0,
          ) || 0) +
          (previousYearStats.reduce(
            (n, { activeOutOfControlFires }) => n + activeOutOfControlFires,
            0,
          ) || 0);
        this.activeBeingHeld =
          (stats.reduce(
            (n, { activeBeingHeldFires }) => n + activeBeingHeldFires,
            0,
          ) || 0) +
          (previousYearStats.reduce(
            (n, { activeBeingHeldFires }) => n + activeBeingHeldFires,
            0,
          ) || 0);
        this.activeUnderControl =
          (stats.reduce(
            (n, { activeUnderControlFires }) => n + activeUnderControlFires,
            0,
          ) || 0) +
          (previousYearStats.reduce(
            (n, { activeUnderControlFires }) => n + activeUnderControlFires,
            0,
          ) || 0);

        this.outOfControlData = [
          { name: 'Out of Control', value: this.activeOutOfControl },
          { name: 'All Fires', value: this.activeFires },
        ];
        this.beingHeldData = [
          { name: 'Being Held', value: this.activeBeingHeld },
          { name: 'All Fires', value: this.activeFires },
        ];
        this.underControlData = [
          { name: 'Under Control', value: this.activeUnderControl },
          { name: 'All Fires', value: this.activeFires },
        ];

        this.activeOutOfControlPct =
          Math.round((this.activeOutOfControl / this.activeFires) * 100) || 0;
        this.activeBeingHeldPct =
          Math.round((this.activeBeingHeld / this.activeFires) * 100) || 0;
        this.activeUnderControlPct =
          Math.round((this.activeUnderControl / this.activeFires) * 100) || 0;

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  selectFireCentre(value) {
    this.queryData();
  }
}
